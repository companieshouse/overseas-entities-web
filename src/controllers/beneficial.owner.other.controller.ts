import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { v4 as uuidv4 } from 'uuid';

import { logger } from "../utils/logger";
import { ApplicationDataType } from "../model";
import { saveAndContinue } from "../utils/save.and.continue";
import { getFromApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import { BeneficialOwnerOtherKey, BeneficialOwnerOtherKeys } from "../model/beneficial.owner.other.model";
import {
  AddressKeys,
  BeneficialOwnerNoc,
  HasSamePrincipalAddressKey,
  ID,
  InputDateKeys,
  IsOnRegisterInCountryFormedInKey,
  IsOnSanctionsListKey,
  NonLegalFirmNoc, PublicRegisterNameKey, RegistrationNumberKey,
  TrusteesNoc
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import { StartDateKey, StartDateKeys } from "../model/date.model";
import { getAllNavigationInfo } from "../utils/navigation";

export const get = (req: Request, res: Response) => {
  const { currentPage, previousPage } = getAllNavigationInfo(req.route.path);
  logger.debugRequest(req, `${req.method} ${currentPage}`);

  return res.render(currentPage, {
    backLinkUrl: previousPage,
    templateName: currentPage
  });
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPage, previousPage } = getAllNavigationInfo(req.route.path);
    logger.debugRequest(req, `GET BY ID ${currentPage}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req, BeneficialOwnerOtherKey, id, true);

    const principalAddress = (data) ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    return res.render(currentPage, {
      backLinkUrl: previousPage,
      templateName: `${currentPage}/${id}`,
      id,
      ...data,
      ...principalAddress,
      ...serviceAddress,
      [StartDateKey]: startDate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPage, nextPage } = getAllNavigationInfo(req.route.path);
    logger.debugRequest(req, `POST ${currentPage}`);

    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

    const session = req.session as Session;
    setApplicationData(session, data, BeneficialOwnerOtherKey);
    await saveAndContinue(req, session, res.locals.isUpdatePath);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPage, nextPage } = getAllNavigationInfo(req.route.path);
    logger.debugRequest(req, `UPDATE ${currentPage}`);

    // Remove old Beneficial Owner
    removeFromApplicationData(req, BeneficialOwnerOtherKey, req.params[ID]);

    // Set Beneficial Owner data
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, req.params[ID]);

    // Save new Beneficial Owner
    const session = req.session as Session;
    setApplicationData(session, data, BeneficialOwnerOtherKey);
    await saveAndContinue(req, session, res.locals.isUpdatePath);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPage, nextPage } = getAllNavigationInfo(req.route.path);
    logger.debugRequest(req, `REMOVE ${currentPage}`);

    removeFromApplicationData(req, BeneficialOwnerOtherKey, req.params[ID]);
    const session = req.session as Session;
    await saveAndContinue(req, session, res.locals.isUpdatePath);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerOtherKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);

  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);

  // It needs concatenations because if in the check boxes we select only one option
  // nunjucks returns just a string and with concat we will return an array.
  data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
  data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];
  data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';
  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

  if (!data[IsOnRegisterInCountryFormedInKey]) {
    data[PublicRegisterNameKey] = "";
    data[RegistrationNumberKey] = "";
  }
  data[ID] = id;

  return data;
};
