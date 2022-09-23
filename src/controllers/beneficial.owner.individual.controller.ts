import { NextFunction, Request, Response } from "express";

import { getFromApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import { ApplicationDataType } from "../model";
import { logger } from "../utils/logger";
import { BeneficialOwnerIndividualKey, BeneficialOwnerIndividualKeys } from "../model/beneficial.owner.individual.model";
import {
  AddressKeys,
  BeneficialOwnerNoc,
  HasSameResidentialAddressKey,
  ID,
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
import { BENEFICIAL_OWNER_INDIVIDUAL_PAGE, BENEFICIAL_OWNER_TYPE_URL } from "../config";
import { v4 as uuidv4 } from "uuid";
import { updateSubmissionData } from "../service/overseas.entities.service";



export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

  return res.render(BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: BENEFICIAL_OWNER_TYPE_URL,
    templateName: BENEFICIAL_OWNER_INDIVIDUAL_PAGE
  });
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET BY ID ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req, BeneficialOwnerIndividualKey, id, true);

    const usualResidentialAddress = (data) ? mapDataObjectToFields(data[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const dobDate = (data) ? mapDataObjectToFields(data[DateOfBirthKey], DateOfBirthKeys, InputDateKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    return res.render(BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
      backLinkUrl: BENEFICIAL_OWNER_TYPE_URL,
      templateName: BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
      id,
      ...data,
      ...usualResidentialAddress,
      ...serviceAddress,
      [DateOfBirthKey]: dobDate,
      [StartDateKey]: startDate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

    setApplicationData(req.session, data, BeneficialOwnerIndividualKey);

    // POC
    await updateSubmissionData(req);
    // end of POC

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `UPDATE ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    // Remove old Beneficial Owner
    removeFromApplicationData(req, BeneficialOwnerIndividualKey, req.params[ID]);

    // Set Beneficial Owner data
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, req.params[ID]);

    // Save new Beneficial Owner
    setApplicationData(req.session, data, BeneficialOwnerIndividualKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `REMOVE ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    removeFromApplicationData(req, BeneficialOwnerIndividualKey, req.params[ID]);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerIndividualKeys);

  data[UsualResidentialAddressKey] = mapFieldsToDataObject(reqBody, UsualResidentialAddressKeys, AddressKeys);
  data[HasSameResidentialAddressKey] = (data[HasSameResidentialAddressKey]) ? +data[HasSameResidentialAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSameResidentialAddressKey])
    ?  mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    :  {};
  data[DateOfBirthKey] = mapFieldsToDataObject(reqBody, DateOfBirthKeys, InputDateKeys);
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);

  // It needs concatenations because if in the check boxes we select only one option
  // nunjucks returns just a string and with concat we will return an array.
  data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
  data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];
  data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

  data[HasSameResidentialAddressKey] = (data[HasSameResidentialAddressKey]) ? +data[HasSameResidentialAddressKey] : '';
  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';

  data[ID] = id;
  return data;
};
