import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../utils/logger";
import { CeasedDateKey } from "../../model/date.model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { isActiveFeature } from "../../utils/feature.flag";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.other";
import { checkAndReviewBeneficialOwner } from "../../utils/update/review.beneficial.owner";
import { addCeasedDateToTemplateOptions } from "../../utils/update/ceased_date_util";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { ApplicationData, ApplicationDataType } from "../../model";
import { AddressKeys, EntityNumberKey } from "../../model/data.types.model";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";

import {
  setApplicationData,
  fetchApplicationData,
  mapDataObjectToFields,
  removeFromApplicationData,
} from "../../utils/application.data";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  PrincipalAddressKey,
  PrincipalAddressKeys,
} from "../../model/address.model";

import {
  RELEVANT_PERIOD_QUERY_PARAM,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const index = req.query.index;
    checkAndReviewBeneficialOwner(req as any, appData);
    let dataToReview = {}, principalAddress = {}, serviceAddress = {};

    if (appData?.beneficial_owners_corporate) {
      dataToReview = appData?.beneficial_owners_corporate[Number(index)] ?? dataToReview;
      const isDataToReview = Object.keys(dataToReview).length;
      principalAddress = isDataToReview ? mapDataObjectToFields(dataToReview[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : principalAddress;
      serviceAddress = isDataToReview ? mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : serviceAddress;
    }

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    });

    const templateOptions = {
      ...dataToReview,
      ...principalAddress,
      ...serviceAddress,
      backLinkUrl,
      entity_number: appData[EntityNumberKey],
      templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE,
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
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const booIndex = req.query.index;
    const requestId = req.body["id"];

    if (isBoReviewable(appData, booIndex, requestId)) {
      checkAndReviewBeneficialOwner(req as any, appData);
    }

    if (booIndex !== undefined &&
        appData.beneficial_owners_corporate &&
        appData.beneficial_owners_corporate[Number(booIndex)].id === requestId
    ) {

      const boData: BeneficialOwnerOther = appData.beneficial_owners_corporate[Number(booIndex)];
      const boId = boData.id;
      const trustIds: string[] = boData?.trust_ids?.length ? [...boData.trust_ids] : [];
      await removeFromApplicationData(req, BeneficialOwnerOtherKey, boId, appData);
      const session = req.session as Session;
      const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

      if (trustIds.length > 0) {
        (data as BeneficialOwnerOther).trust_ids = [...trustIds];
      }
      console.log(isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL));
      if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        await setApplicationData(req, data, BeneficialOwnerOtherKey);
      } else {
        await setApplicationData(req.session, data, BeneficialOwnerOtherKey);
        await saveAndContinue(req, session);
      }
    }

    const boTypeRedirectUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    });

    if (checkRelevantPeriod(appData)) {
      return res.redirect(boTypeRedirectUrl + RELEVANT_PERIOD_QUERY_PARAM);
    } else {
      return res.redirect(boTypeRedirectUrl);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const isBoReviewable = (appData: ApplicationData, booiIndex: any, requestId: string | undefined): boolean => {
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && (
    !booiIndex ||
    !appData?.beneficial_owners_corporate ||
    !appData?.beneficial_owners_corporate[Number(booiIndex)]?.id ||
    appData.beneficial_owners_corporate[Number(booiIndex)].id !== requestId)
  ) {
    return true;
  }
  return false;
};
