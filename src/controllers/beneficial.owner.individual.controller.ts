import { NextFunction, Request, Response } from "express";
import { getFromApplicationData, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import { ApplicationDataType, beneficialOwnerIndividualType } from "../model";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

  return res.render(config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
    id: req.params.id,
    ...getFromApplicationData(req.session, beneficialOwnerIndividualType.BeneficialOwnerIndividualKey, +req.params.id)
  });
};

// Add new beneficialOwnerIndividual
export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    const data: ApplicationDataType = prepareOwnerData(req.body);

    setApplicationData(req.session, data, beneficialOwnerIndividualType.BeneficialOwnerIndividualKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

// Update existing beneficialOwnerIndividual
export const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`UPDATE ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    // Remove old beneficialOwnerIndividual
    removeFromApplicationData(req.session, beneficialOwnerIndividualType.BeneficialOwnerIndividualKey, +req.params.id);

    // Generate new data for beneficialOwnerIndividual
    const data: ApplicationDataType = prepareOwnerData(req.body);

    // Save new beneficialOwnerIndividual
    setApplicationData(req.session, data, beneficialOwnerIndividualType.BeneficialOwnerIndividualKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

// Remove beneficialOwnerIndividual
export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`REMOVE ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    removeFromApplicationData(req.session, beneficialOwnerIndividualType.BeneficialOwnerIndividualKey, +req.params.id);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const prepareOwnerData = (reqBody): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, beneficialOwnerIndividualType.BeneficialOwnerIndividualKeys);
  data[beneficialOwnerIndividualType.UsualResidentialAddressKey] = prepareData(reqBody, beneficialOwnerIndividualType.UsualResidentialAddressKeys);
  data[beneficialOwnerIndividualType.ServiceAddressKey] = prepareData(reqBody, beneficialOwnerIndividualType.ServiceAddressKeys);
  data[beneficialOwnerIndividualType.DateOfBirthKey] = prepareData(reqBody, beneficialOwnerIndividualType.DateOfBirthKeys);
  data[beneficialOwnerIndividualType.StartDateKey] = prepareData(reqBody, beneficialOwnerIndividualType.StartDateKeys);

  return data;
};
