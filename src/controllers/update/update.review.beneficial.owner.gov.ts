import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE } from "../../config";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, mapDataObjectToFields, removeFromApplicationData, setApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";
import { ApplicationDataType } from "../../model";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.gov";
import { v4 as uuidv4 } from "uuid";
import { BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { Session } from "@companieshouse/node-session-handler";
import { saveAndContinue } from "../../utils/save.and.continue";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../../model/address.model";
import { AddressKeys } from "../../model/data.types.model";
import { CeasedDateKey } from "../../model/date.model";
import { addCeasedDateToTemplateOptions } from "../../utils/update/ceased_date_util";

export const get = async (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = await getApplicationData(req.session);
  const index = req.query.index;

  let dataToReview = {}, principalAddress = {}, serviceAddress = {};
  if (appData?.beneficial_owners_government_or_public_authority){
    dataToReview = appData?.beneficial_owners_government_or_public_authority[Number(index)];
    principalAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    serviceAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
  }

  const templateOptions = {
    backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE,
    ...dataToReview,
    ...principalAddress,
    ...serviceAddress
  };

  if (CeasedDateKey in dataToReview) {
    return res.render(templateOptions.templateName, addCeasedDateToTemplateOptions(templateOptions, appData, dataToReview));
  } else {
    return res.render(templateOptions.templateName, templateOptions);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const boiIndex = req.query.index;
    const appData = await getApplicationData(req.session);

    if (boiIndex !== undefined && appData.beneficial_owners_government_or_public_authority && appData.beneficial_owners_government_or_public_authority[Number(boiIndex)].id === req.body["id"]){
      const boId = appData.beneficial_owners_government_or_public_authority[Number(boiIndex)].id;
      removeFromApplicationData(req, BeneficialOwnerGovKey, boId);

      const session = req.session as Session;

      const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

      await setApplicationData(req.session, data, BeneficialOwnerGovKey);

      await saveAndContinue(req, session, false);
    }
    return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    next(error);
  }
};

