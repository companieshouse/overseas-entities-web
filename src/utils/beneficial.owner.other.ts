import { NextFunction, Request, Response } from "express";
import { logger } from "./logger";
import { Session } from "@companieshouse/node-session-handler";
import { saveAndContinue } from "./save.and.continue";
import { ApplicationData, ApplicationDataType } from "../model";
import {
  getApplicationData,
  getFromApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
  setBoNocDataAsArrays
} from "./application.data";
import { addCeasedDateToTemplateOptions } from "../utils/update/ceased_date_util";
import { BeneficialOwnerOther, BeneficialOwnerOtherKey, BeneficialOwnerOtherKeys } from "../model/beneficial.owner.other.model";
import {
  AddressKeys,
  EntityNumberKey,
  HasSamePrincipalAddressKey,
  ID,
  InputDateKeys,
  IsOnRegisterInCountryFormedInKey,
  IsOnSanctionsListKey,
  PublicRegisterNameKey,
  RegistrationNumberKey,
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import {
  CeasedDateKey,
  CeasedDateKeys,
  StartDateKey,
  StartDateKeys
} from "../model/date.model";
import { v4 as uuidv4 } from 'uuid';
import * as config from "../config";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";
import { isActiveFeature } from "./feature.flag";

export const getBeneficialOwnerOther = async (req: Request, res: Response, templateName: string, backLinkUrl: string): Promise<void> => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  const appData: ApplicationData = await getApplicationData(req.session);

  return res.render(templateName, {
    backLinkUrl: backLinkUrl,
    templateName: templateName,
    ...appData,
    relevant_period: req.query["relevant-period"] === "true",
    FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
  });
};

export const getBeneficialOwnerOtherById = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): Promise<void> => {
  try {
    logger.debugRequest(req, `GET BY ID ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req.session);

    const id = req.params[ID];
    const data = await getFromApplicationData(req, BeneficialOwnerOtherKey, id, true);

    const principalAddress = (data) ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    const templateOptions = {
      backLinkUrl: backLinkUrl,
      templateName: `${templateName}/${id}`,
      id,
      ...data,
      ...principalAddress,
      ...serviceAddress,
      [StartDateKey]: startDate,
      entity_name: appData.entity_name,
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
    };

    // Redis removal work - Add extra template options if Redis Remove flag is true and on Registration journey
    const isRegistration: boolean = req.path.startsWith(config.LANDING_URL);
    if (isRegistration) {
      addActiveSubmissionBasePathToTemplateData(templateOptions, req);
    }

    if (EntityNumberKey in appData && appData[EntityNumberKey]) {
      return res.render(templateName, addCeasedDateToTemplateOptions(templateOptions, appData, data));
    } else {
      return res.render(templateName, templateOptions);
    }

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const data: ApplicationDataType = await setBeneficialOwnerData(req.body, uuidv4());

    const session = req.session as Session;
    await setApplicationData(session, data, BeneficialOwnerOtherKey);

    await saveAndContinue(req, session);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {
  try {
    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    const id = req.params[ID];
    const boData: BeneficialOwnerOther = await getFromApplicationData(req, BeneficialOwnerOtherKey, id, true);

    const trustIds: string[] = boData?.trust_ids?.length ? [...boData.trust_ids] : [];

    // Remove old Beneficial Owner
    await removeFromApplicationData(req, BeneficialOwnerOtherKey, id);

    // Set Beneficial Owner data
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, id);

    if (trustIds.length > 0) {
      (data as BeneficialOwnerOther).trust_ids = [...trustIds];
    }

    // Save new Beneficial Owner
    const session = req.session as Session;
    await setApplicationData(session, data, BeneficialOwnerOtherKey);

    await saveAndContinue(req, session);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {
  try {
    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    await removeFromApplicationData(req, BeneficialOwnerOtherKey, req.params[ID]);
    const session = req.session as Session;

    await saveAndContinue(req, session);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerOtherKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);

  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  data[CeasedDateKey] = reqBody["is_still_bo"] === '0' ? mapFieldsToDataObject(reqBody, CeasedDateKeys, InputDateKeys) : {};

  setBoNocDataAsArrays(data);

  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';
  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

  if (!data[IsOnRegisterInCountryFormedInKey]) {
    data[PublicRegisterNameKey] = "";
    data[RegistrationNumberKey] = "";
  }
  data[ID] = id;

  return data;
};
