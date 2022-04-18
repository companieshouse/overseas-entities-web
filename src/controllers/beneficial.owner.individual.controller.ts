import { NextFunction, Request, Response } from "express";
import { getApplicationData, mapObjectFieldToAddress, prepareData, setApplicationData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType, beneficialOwnerIndividualType } from "../model";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

  const appData: ApplicationData = getApplicationData(req.session);

  return res.render(config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
    ...appData.beneficialOwnerIndividual
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, beneficialOwnerIndividualType.BeneficialOwnerIndividualKeys);
    data[beneficialOwnerIndividualType.UsualResidentialAddressKey] = mapObjectFieldToAddress(req.body, beneficialOwnerIndividualType.UsualResidentialAddressKeys);
    data[beneficialOwnerIndividualType.ServiceAddressKey] = mapObjectFieldToAddress(req.body, beneficialOwnerIndividualType.ServiceAddressKeys);
    data[beneficialOwnerIndividualType.DateOfBirthKey] = prepareData(req.body, beneficialOwnerIndividualType.DateOfBirthKeys);
    data[beneficialOwnerIndividualType.StartDateKey] = prepareData(req.body, beneficialOwnerIndividualType.StartDateKeys);

    setApplicationData(req.session, data, beneficialOwnerIndividualType.BeneficialOwnerIndividualKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
