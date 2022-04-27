import { NextFunction, Request, Response } from "express";

import { getApplicationData, mapFieldsToDataObject, prepareData, setApplicationData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";
import {
  BeneficialOwnerIndividualKey, BeneficialOwnerIndividualKeys, DateOfBirthKey, DateOfBirthKeys, HasSameAddressKey, IsOnSanctionsListKey,
  ServiceAddressKey, ServiceAddressKeys, StartDateKey, StartDateKeys, UsualResidentialAddressKey, UsualResidentialAddressKeys,
} from "../model/beneficial.owner.individual.model";
import { AddressKeys, InputDateKeys } from "../model/data.types.model";

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

    data[UsualResidentialAddressKey] = mapFieldsToDataObject(req.body, UsualResidentialAddressKeys, AddressKeys);
    data[ServiceAddressKey] = mapFieldsToDataObject(req.body, ServiceAddressKeys, AddressKeys);

    data[DateOfBirthKey] = mapFieldsToDataObject(req.body, DateOfBirthKeys, InputDateKeys);
    data[StartDateKey] = mapFieldsToDataObject(req.body, StartDateKeys, InputDateKeys);

    data[HasSameAddressKey] = +data[HasSameAddressKey];
    data[IsOnSanctionsListKey] = +data[IsOnSanctionsListKey];

    setApplicationData(req.session, data, BeneficialOwnerIndividualKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
