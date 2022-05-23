import { NextFunction, Request, Response } from "express";

import { getApplicationData, mapFieldsToDataObject, prepareData, setApplicationData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { BeneficialOwnerIndividualKey, BeneficialOwnerIndividualKeys } from "../model/beneficial.owner.individual.model";
import {
  AddressKeys,
  BeneficialOwnerNoc,
  HasSameResidentialAddressKey,
  InputDateKeys,
  IsOnSanctionsListKey,
  NonLegalFirmNoc,
  TrusteesNoc,
} from "../model/data.types.model";
import {
  ServiceAddressKey,
  ServiceAddressKeys,
  UsualResidentialAddressKey,
  UsualResidentialAddressKeys,
} from "../model/address.model";
import {
  DateOfBirthKey,
  DateOfBirthKeys,
  StartDateKey,
  StartDateKeys,
} from "../model/date.model";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

  const appData: ApplicationData = getApplicationData(req.session);

  const boIndividual = appData[BeneficialOwnerIndividualKey];

  return res.render(config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
    ...boIndividual
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

    // It needs concatenations because if in the check boxes we select only one option
    // nunjucks returns just a string and with concat we will return an array.
    data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
    data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];
    data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

    data[HasSameResidentialAddressKey] = (data[HasSameResidentialAddressKey]) ? +data[HasSameResidentialAddressKey] : '';
    data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';

    setApplicationData(req.session, data, BeneficialOwnerIndividualKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
