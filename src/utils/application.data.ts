import { Request } from "express";
import { Session } from '@companieshouse/node-session-handler';
import { BeneficialOwnerCorporate } from '@companieshouse/api-sdk-node/dist/services/overseas-entities';
import { BeneficialOwnerOtherKey } from '../model/beneficial.owner.other.model';
import { Remove } from '../model/remove.type.model';
import { isActiveFeature } from "./feature.flag";
import { isNoChangeJourney } from "./update/no.change.journey";
import { isRegistrationJourney } from "./url";

import { createAndLogErrorRequest, logger } from './logger';
import { getOverseasEntity, updateOverseasEntity } from "../service/overseas.entities.service";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from '../model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from '../model/beneficial.owner.individual.model';
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from '../model/managing.officer.corporate.model';
import { ManagingOfficerIndividual, ManagingOfficerKey } from '../model/managing.officer.model';

import {
  ApplicationData,
  APPLICATION_DATA_KEY,
  ApplicationDataType,
  ApplicationDataArrayType
} from "../model";

import {
  ID,
  BeneficialOwnerNoc,
  NonLegalFirmControlNoc,
  NonLegalFirmNoc,
  OwnerOfLandOtherEntityJurisdictionsNoc,
  OwnerOfLandPersonJurisdictionsNoc,
  TrustControlNoc,
  TrusteesNoc,
  OverseasEntityKey,
  Transactionkey,
  PaymentKey,
} from '../model/data.types.model';

import {
  PARAM_BENEFICIAL_OWNER_GOV,
  PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
  PARAM_BENEFICIAL_OWNER_OTHER,
  PARAM_MANAGING_OFFICER_CORPORATE,
  PARAM_MANAGING_OFFICER_INDIVIDUAL,
  FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  ROUTE_PARAM_TRANSACTION_ID,
  ROUTE_PARAM_SUBMISSION_ID
} from '../config';

/**
 * @todo: remove this method after REDIS removal has been implemented for the Update/Remove journeys (ROE-2645)
 */
export const fetchApplicationData = (req: Request, isRegistrationOrUpdate: boolean, forceFetch: boolean = false): Promise<ApplicationData> => {
  if (isRegistrationOrUpdate) {
    return getApplicationData(req, forceFetch);
  } else {
    return getApplicationData(req.session);
  }
};

export const getApplicationData = async (sessionOrRequest: Session | Request | undefined, forceFetch: boolean = false): Promise<ApplicationData> => {

  const emptyAppData = {};
  let req: Request;
  let session: Session;

  try {

    if (!isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) || (sessionOrRequest instanceof Session)) {
      session = sessionOrRequest instanceof Session ? sessionOrRequest : sessionOrRequest?.session as Session;
      return session?.getExtraData(APPLICATION_DATA_KEY) || {} as ApplicationData;
    }

    if (!sessionOrRequest) {
      return emptyAppData;
    }

    req = sessionOrRequest;

    const transactionId: string = req.params[ROUTE_PARAM_TRANSACTION_ID] ?? "";
    const submissionId: string = req.params[ROUTE_PARAM_SUBMISSION_ID] ?? "";

    if (transactionId === "" || submissionId === "") {
      return emptyAppData;
    }

    const appData = await getOverseasEntity(req, transactionId, submissionId, forceFetch);
    appData[Transactionkey] = transactionId;
    appData[OverseasEntityKey] = submissionId;

    return appData;

  } catch (e) {
    logger.error(`Error getting application data, with error object: ${e}`);
    return emptyAppData;
  }
};

export const deleteApplicationData = (session: Session | undefined): boolean | undefined => {
  return session?.deleteExtraData(APPLICATION_DATA_KEY);
};

export const setApplicationData = async (sessionOrRequest: Request | Session | undefined, data: any, key: string): Promise<undefined | void> => {

  let appData: ApplicationData;
  let req: Request | undefined;
  let session: Session | undefined;

  try {

    if (!isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) || (sessionOrRequest instanceof Session)) {
      session = sessionOrRequest instanceof Session ? sessionOrRequest : sessionOrRequest?.session as Session;
      appData = await getApplicationData(session);
    } else {
      req = sessionOrRequest;
      appData = await getApplicationData(req);
    }

    if (!ApplicationDataArrayType.includes(key)) {
      appData = { ...appData, [key]: data } as ApplicationData;
    } else {
      if (!appData[key]) {
        appData[key] = [];
      }
      appData[key].push(data);
    }

    if (session) {
      return setExtraData(session, appData);
    }

    setExtraData(req?.session as Session, appData);

    const forceUpdate: boolean = key === PaymentKey;

    return updateOverseasEntity(req as Request, req?.session as Session, appData, forceUpdate);

  } catch (e) {
    logger.error(`Error setting application data, with error object: ${e}`);
  }

};

export const setExtraData = (session: Session | undefined, appData: ApplicationData): undefined | void => {
  return session?.setExtraData(APPLICATION_DATA_KEY, appData);
};

export const prepareData = (data: any, keys: string[]): ApplicationDataType => {
  return keys.reduce((o, key) => Object.assign(o, { [key]: data[key] }), {});
};

export const mapFieldsToDataObject = (data: any, htmlFields: string[], dataModelKeys: string[]) => {
  return (data) ? htmlFields.reduce((o, key, i) => Object.assign(o, { [dataModelKeys[i]]: data[key] }), {}) : {};
};

export const mapDataObjectToFields = (data: any, htmlFields: string[], dataModelKeys: string[]) => {
  return (data) ? htmlFields.reduce((o, key, i) => Object.assign(o, { [key]: data[dataModelKeys[i]] }), {}) : {};
};

export const allBeneficialOwners = (appData: ApplicationData): Array<BeneficialOwnerIndividual | BeneficialOwnerCorporate | BeneficialOwnerGov> => {
  if (!isNoChangeJourney(appData)) {
    return (appData.beneficial_owners_individual?.filter(boi => !boi.relevant_period) ?? [])
      .concat(
        appData.beneficial_owners_government_or_public_authority?.filter(bog => !bog.relevant_period) ?? [],
        appData.beneficial_owners_corporate?.filter(boo => !boo.relevant_period) ?? []);
  } else {
    return (appData.update?.review_beneficial_owners_individual?.filter(boi => !boi.relevant_period) ?? [])
      .concat(
        appData.update?.review_beneficial_owners_government_or_public_authority?.filter(bog => !bog.relevant_period) ?? [],
        appData.update?.review_beneficial_owners_corporate?.filter(boo => !boo.relevant_period) ?? []);
  }
};

export const allManagingOfficers = (appData: ApplicationData): Array<ManagingOfficerIndividual | ManagingOfficerCorporate> => {
  if (!isNoChangeJourney(appData)) {
    return (appData.managing_officers_individual ?? []).concat(appData.managing_officers_corporate ?? []);
  } else {
    return (appData.update?.review_managing_officers_individual ?? []).concat(appData.update?.review_managing_officers_corporate ?? []);
  }
};

export const checkActiveBOExists = (appData: ApplicationData): boolean => {
  return allBeneficialOwners(appData).some((bo) => !bo.ceased_date || Object.keys(bo.ceased_date).length === 0);
};

export const checkBOsDetailsEntered = (appData: ApplicationData): boolean => {
  return Boolean( appData[BeneficialOwnerIndividualKey]?.length || appData[BeneficialOwnerOtherKey]?.length || appData[BeneficialOwnerGovKey]?.length );
};

export const checkActiveMOExists = (appData: ApplicationData): boolean => {
  return allManagingOfficers(appData).some((mo) => !mo.resigned_on || Object.keys(mo.resigned_on).length === 0);
};

export const checkMOsDetailsEntered = (appData: ApplicationData): boolean => {
  return Boolean( appData[ManagingOfficerKey]?.length || appData[ManagingOfficerCorporateKey]?.length ) ;
};

export const hasAddedOrCeasedBO = (appData: ApplicationData): boolean => {
  return allBeneficialOwners(appData).some(bo => (bo.ceased_date && Object.keys(bo.ceased_date).length !== 0) || !bo.ch_reference);
};

export const findBoOrMo = (appData: ApplicationData, boMoType: string, id: string) => {
  let boMos;
  switch (boMoType) {
      case PARAM_BENEFICIAL_OWNER_INDIVIDUAL:
        boMos = appData[BeneficialOwnerIndividualKey];
        break;
      case PARAM_BENEFICIAL_OWNER_GOV:
        boMos = appData[BeneficialOwnerGovKey];
        break;
      case PARAM_BENEFICIAL_OWNER_OTHER:
        boMos = appData[BeneficialOwnerOtherKey];
        break;
      case PARAM_MANAGING_OFFICER_INDIVIDUAL:
        boMos = appData[ManagingOfficerKey];
        break;
      case PARAM_MANAGING_OFFICER_CORPORATE:
        boMos = appData[ManagingOfficerCorporateKey];
        break;
      default:
        return undefined;
  }

  return boMos.find(boMo => boMo.id === id);
};

export const checkGivenBoOrMoDetailsExist = (appData: ApplicationData, boMoType: string, id: string): boolean =>
  findBoOrMo(appData, boMoType, id) ? true : false;

export const setBoNocDataAsArrays = (data: ApplicationDataType) => {
  // It needs concatenations because if in the check boxes we select only one option
  // nunjucks returns just a string and with concat we will return an array.
  data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
  data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];

  // Should be able to move this into an else on the feature flag if statement below when we apply new nocs to update journey
  data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

  if (isActiveFeature(FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)) {
    data[TrustControlNoc] = data[TrustControlNoc] ? [].concat(data[TrustControlNoc]) : [];
    data[NonLegalFirmControlNoc] = data[NonLegalFirmControlNoc] ? [].concat(data[NonLegalFirmControlNoc]) : [];
    data[OwnerOfLandPersonJurisdictionsNoc] = data[OwnerOfLandPersonJurisdictionsNoc] ? [].concat(data[OwnerOfLandPersonJurisdictionsNoc]) : [];
    data[OwnerOfLandOtherEntityJurisdictionsNoc] = data[OwnerOfLandOtherEntityJurisdictionsNoc] ? [].concat(data[OwnerOfLandOtherEntityJurisdictionsNoc]) : [];
  }
};

export const removeFromApplicationData = async (req: Request, key: string, id: string): Promise<void> => {
  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
  const index = getIndexInApplicationData(req, appData, key, id, true);
  if (index === -1) {
    throw createAndLogErrorRequest(req, `application.data removeFromApplicationData - unable to find object in session data for key ${key} and ID ${id}`);
  }
  appData[key].splice(index, 1);
  setExtraData(req.session, appData);
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
    await updateOverseasEntity(req, req.session as Session, appData);
  }
};

// gets data from ApplicationData. errorIfNotFound boolean indicates whether an error should be thrown if no data found.
export const getFromApplicationData = async (req: Request, key: string, id: string, errorIfNotFound: boolean = true): Promise<any> => {
  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
  const index = getIndexInApplicationData(req, appData, key, id, errorIfNotFound);

  if (index === -1) {
    if (errorIfNotFound) {
      throw createAndLogErrorRequest(req, `application.data getFromApplicationData - unable to find object in session data for key ${key} and ID ${id}`);
    } else {
      return undefined;
    }
  }

  if (appData[key] !== undefined) {
    return appData[key][index];
  }
};

const getIndexInApplicationData = (req: Request, appData: ApplicationData, key: string, id: string, errorIfNotFound: boolean) => {
  if (id && appData && appData[key]) {
    return appData[key].findIndex(object => object[ID] === id);
  }
  if (errorIfNotFound) {
    throw createAndLogErrorRequest(req, `application.data getIndexInApplicationData - unable to find object in session data for key ${key} and ID ${id}`);
  }
};

export const getRemove = (appData: ApplicationData): Remove => {
  return appData.remove || {};
};
