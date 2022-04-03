import { NextFunction, Request, Response } from "express";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType, beneficialOwnerTypeType } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { BeneficialOwnerType } from "../model/beneficial.owner.type.model";
import { BeneficialOwnerTypeChoice } from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.ENTITY_URL,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

    // to be removed
    const data: ApplicationDataType = prepareData(req.body, beneficialOwnerTypeType.BeneficialOwnerTypeKeys);
    setApplicationData(req.session, data, beneficialOwnerTypeType.BeneficialOwnerTypeKey);

    const beneficialOwnerTypeData: BeneficialOwnerType = data as BeneficialOwnerType;
    return res.redirect(getNextPage(beneficialOwnerTypeData.beneficialOwnerType));
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getNextPage = (beneficialOwnerTypeChoices?: BeneficialOwnerTypeChoice): string => {
  if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.individualOwner) {
    return config.BENEFICIAL_OWNER_INDIVIDUAL_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.otherLegalOwner) {
    return config.BENEFICIAL_OWNER_OTHER_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.governmentOrPublicOwner) {
    return config.BENEFICIAL_OWNER_GOV_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.corporateOfficer) {
    return config.MANAGING_OFFICER_CORPORATE_URL;
  } else if (beneficialOwnerTypeChoices === BeneficialOwnerTypeChoice.individualOfficer) {
    return config.MANAGING_OFFICER_URL;
  }
  return config.BENEFICIAL_OWNER_TYPE_URL;
};
