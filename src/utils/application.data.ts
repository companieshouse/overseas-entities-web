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
import { BeneficialOwnerGovKey } from '../model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividualKey } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../model/beneficial.owner.other.model';
import { ManagingOfficerCorporateKey } from '../model/managing.officer.corporate.model';
import { ManagingOfficerKey } from '../model/managing.officer.model';
import { PARAM_BENEFICIAL_OWNER_GOV, PARAM_BENEFICIAL_OWNER_INDIVIDUAL, PARAM_BENEFICIAL_OWNER_OTHER } from '../config';

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

export const checkBOsDetailsEntered = (appData: ApplicationData): boolean => {
  return Boolean( appData[BeneficialOwnerIndividualKey]?.length || appData[BeneficialOwnerOtherKey]?.length || appData[BeneficialOwnerGovKey]?.length );
};

export const checkMOsDetailsEntered = (appData: ApplicationData): boolean => {
  return Boolean( appData[ManagingOfficerKey]?.length || appData[ManagingOfficerCorporateKey]?.length ) ;
};

export const findBeneficialOwner = (appData: ApplicationData, beneficialOwnerType: string, id: string) => {
  switch (beneficialOwnerType) {
      case PARAM_BENEFICIAL_OWNER_INDIVIDUAL:
        return appData[BeneficialOwnerIndividualKey]?.find(beneficialOwner => beneficialOwner.id === id);
      case PARAM_BENEFICIAL_OWNER_GOV:
        return appData[BeneficialOwnerGovKey]?.find(beneficialOwner => beneficialOwner.id === id);
      case PARAM_BENEFICIAL_OWNER_OTHER:
        return appData[BeneficialOwnerOtherKey]?.find(beneficialOwner => beneficialOwner.id === id);
      default:
        return undefined;
  }
};

export const checkGivenBoDetailsExist = (appData: ApplicationData, beneficialOwnerType: string, id: string): boolean => {
  return findBeneficialOwner(appData, beneficialOwnerType, id) ? true : false;
};

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
