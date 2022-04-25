import { NextFunction, Request, Response } from "express";

import { getApplicationData, mapObjectFieldToAddress, prepareData, setApplicationData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";
import {
  BeneficialOwnerIndividualKey, BeneficialOwnerIndividualKeys, DateOfBirthKey, DateOfBirthKeys, HasSameAddressKey, IsOnSanctionsListKey,
  ServiceAddressKey, ServiceAddressKeys, StartDateKey, StartDateKeys, UsualResidentialAddressKey, UsualResidentialAddressKeys,
} from "../model/beneficial.owner.individual.model";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

  const appData: ApplicationData = getApplicationData(req.session);

  return res.render(config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
    ...appData.beneficial_owners_individual
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, BeneficialOwnerIndividualKeys);
    data[UsualResidentialAddressKey] = mapObjectFieldToAddress(req.body, UsualResidentialAddressKeys);
    data[ServiceAddressKey] = mapObjectFieldToAddress(req.body, ServiceAddressKeys);
    data[DateOfBirthKey] = prepareData(req.body, DateOfBirthKeys);
    data[StartDateKey] = prepareData(req.body, StartDateKeys);
    data[HasSameAddressKey] = +data[HasSameAddressKey];
    data[IsOnSanctionsListKey] = +data[IsOnSanctionsListKey];

    setApplicationData(req.session, data, BeneficialOwnerIndividualKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
