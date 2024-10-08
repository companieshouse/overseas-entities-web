import {
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE,
  RELEVANT_PERIOD_QUERY_PARAM,
  FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
} from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, mapDataObjectToFields, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { CeasedDateKey } from "../../model/date.model";
import { addCeasedDateToTemplateOptions } from "../../utils/update/ceased_date_util";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationDataType } from "../../model";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.other";
import { v4 as uuidv4 } from "uuid";
import { saveAndContinue } from "../../utils/save.and.continue";
import {
  PrincipalAddressKey,
  PrincipalAddressKeys,
  ServiceAddressKey,
  ServiceAddressKeys
} from "../../model/address.model";
import { AddressKeys, EntityNumberKey } from "../../model/data.types.model";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { isActiveFeature } from "../../utils/feature.flag";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = await getApplicationData(req.session);
    const index = req.query.index;

    let dataToReview = {}, principalAddress = {}, serviceAddress = {};

    if (appData?.beneficial_owners_corporate){
      dataToReview = appData?.beneficial_owners_corporate[Number(index)];
      principalAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
      serviceAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    }

    const templateOptions = {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
      templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE,
      ...dataToReview,
      ...principalAddress,
      ...serviceAddress,
      entity_number: appData[EntityNumberKey],
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
    };

    if (CeasedDateKey in dataToReview) {
      return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE, addCeasedDateToTemplateOptions(templateOptions, appData, dataToReview));
    } else {
      return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE, templateOptions);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const booIndex = req.query.index;
    const appData = await getApplicationData(req.session);

    if (booIndex !== undefined && appData.beneficial_owners_corporate && appData.beneficial_owners_corporate[Number(booIndex)].id === req.body["id"]) {
      const boData: BeneficialOwnerOther = appData.beneficial_owners_corporate[Number(booIndex)];
      const boId = boData.id;

      const trustIds: string[] = boData?.trust_ids?.length ? [...boData.trust_ids] : [];

      await removeFromApplicationData(req, BeneficialOwnerOtherKey, boId);

      const session = req.session as Session;

      const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

      if (trustIds.length > 0) {
        (data as BeneficialOwnerOther).trust_ids = [...trustIds];
      }

      await setApplicationData(req.session, data, BeneficialOwnerOtherKey);

      await saveAndContinue(req, session);
    }
    if (checkRelevantPeriod(appData)) {
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
    } else {
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
