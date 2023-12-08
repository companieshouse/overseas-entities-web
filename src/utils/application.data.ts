import { Session } from '@companieshouse/node-session-handler';
import { Request } from "express";

import { createAndLogErrorRequest } from './logger';
import { ID } from '../model/data.types.model';
import {
  ApplicationData,
  APPLICATION_DATA_KEY,
  ApplicationDataType,
  ApplicationDataArrayType
} from "../model";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from '../model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../model/beneficial.owner.other.model';
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from '../model/managing.officer.corporate.model';
import { ManagingOfficerIndividual, ManagingOfficerKey } from '../model/managing.officer.model';
import { PARAM_BENEFICIAL_OWNER_GOV, PARAM_BENEFICIAL_OWNER_INDIVIDUAL, PARAM_BENEFICIAL_OWNER_OTHER, PARAM_MANAGING_OFFICER_CORPORATE, PARAM_MANAGING_OFFICER_INDIVIDUAL } from '../config';
import { BeneficialOwnerCorporate } from '@companieshouse/api-sdk-node/dist/services/overseas-entities';
import { Remove } from 'model/remove.type.model';

export const getApplicationData = (session: Session | undefined): ApplicationData => {
  return session?.getExtraData(APPLICATION_DATA_KEY) || {} as ApplicationData;
};

export const deleteApplicationData = (session: Session | undefined): boolean | undefined => {
  return session?.deleteExtraData(APPLICATION_DATA_KEY);
};

export const setApplicationData = (session: Session | undefined, data: any, key: string): undefined | void => {
  let appData: ApplicationData = getApplicationData(session);

  if (ApplicationDataArrayType.includes(key)){
    if ( !appData[key] ) { appData[key] = []; }
    appData[key].push(data);
  } else {
    appData = { ...appData, [key]: { ...data } } as ApplicationData;
  }

  return setExtraData(session, appData);
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
  if (!appData.update?.no_change) {
    return (appData.beneficial_owners_individual ?? [])
      .concat(
        appData.beneficial_owners_government_or_public_authority ?? [],
        appData.beneficial_owners_corporate ?? []);
  } else {
    return (appData.update.review_beneficial_owners_individual ?? [])
      .concat(
        appData.update.review_beneficial_owners_government_or_public_authority ?? [],
        appData.update.review_beneficial_owners_corporate ?? []);
  }
};

export const allManagingOfficers = (appData: ApplicationData): Array<ManagingOfficerIndividual | ManagingOfficerCorporate> => {
  if (!appData.update?.no_change) {
    return (appData.managing_officers_individual ?? []).concat(appData.managing_officers_corporate ?? []);
  } else {
    return (appData.update.review_managing_officers_individual ?? []).concat(appData.update?.review_managing_officers_corporate ?? []);
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

export const removeFromApplicationData = (req: Request, key: string, id: string) => {
  const session = req.session;
  const appData: ApplicationData = getApplicationData(session);

  const index = getIndexInApplicationData(req, appData, key, id, true);
  if (index === -1) {
    throw createAndLogErrorRequest(req, `application.data removeFromApplicationData - unable to find object in session data for key ${key} and ID ${id}`);
  }
  appData[key].splice(index, 1);
  setExtraData(session, appData);
};

// gets data from ApplicationData. errorIfNotFound boolean indicates whether an error should be thrown if no data found.
export const getFromApplicationData = (req: Request, key: string, id: string, errorIfNotFound: boolean = true): any => {
  const appData: ApplicationData = getApplicationData(req.session);

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
