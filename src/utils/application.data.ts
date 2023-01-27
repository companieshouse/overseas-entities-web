import { Session } from '@companieshouse/node-session-handler';
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";


import { createAndLogErrorRequest } from './logger';
import { HasSoldLandKey, ID, IsSecureRegisterKey, OverseasEntityKey, Transactionkey } from '../model/data.types.model';
import {
  ApplicationData,
  APPLICATION_DATA_KEY,
  ApplicationDataType,
  ApplicationDataArrayType
} from "../model";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from '../model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from '../model/beneficial.owner.individual.model';
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from '../model/beneficial.owner.other.model';
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from '../model/managing.officer.corporate.model';
import { ManagingOfficerIndividual, ManagingOfficerKey } from '../model/managing.officer.model';
import { OverseasEntityDueDiligence, DueDiligence } from '@companieshouse/api-sdk-node/dist/services/overseas-entities';
import { DueDiligenceKey } from '../model/due.diligence.model';
import { OverseasEntityDueDiligenceKey } from '../model/overseas.entity.due.diligence.model';
import { WhoIsRegisteringKey, WhoIsRegisteringType } from '../model/who.is.making.filing.model';
import { getOverseasEntity } from '../service/overseas.entities.service';

export const getApplicationData = (session: Session | undefined): ApplicationData => {
  return session?.getExtraData(APPLICATION_DATA_KEY) || {} as ApplicationData;
};

export const deleteApplicationData = (session: Session | undefined): boolean | undefined => {
  return session?.deleteExtraData(APPLICATION_DATA_KEY);
};

export const setApplicationData = (session: Session | undefined, dataToAdd: any, key: string): undefined | void => {
  const appData: ApplicationData = getApplicationData(session);

  updateApplicationData(appData, dataToAdd, key);

  return setExtraData(session, appData);
};

export const updateApplicationData = (appData: ApplicationData, dataToAdd: any, key: string) => {
  if (ApplicationDataArrayType.includes(key)){
    if ( !appData[key] ) { appData[key] = []; }
    appData[key].push(dataToAdd);
  } else {
    appData = { ...appData, [key]: { ...dataToAdd } } as ApplicationData;
  }
  return appData;
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

export const setDefaultRegistrationValues = (appData: ApplicationData, transactionId: string, overseaEntityId: string) => {
  appData[BeneficialOwnerIndividualKey] = (appData[BeneficialOwnerIndividualKey] as BeneficialOwnerIndividual[])
    .map( boi => { return { ...boi, [ID]: uuidv4() }; } );
  appData[BeneficialOwnerOtherKey] = (appData[BeneficialOwnerOtherKey] as BeneficialOwnerOther[] )
    .map( boo => { return { ...boo, [ID]: uuidv4() }; } );
  appData[BeneficialOwnerGovKey] = (appData[BeneficialOwnerGovKey] as BeneficialOwnerGov[])
    .map( bog => { return { ...bog, [ID]: uuidv4() }; } );
  appData[ManagingOfficerKey] = (appData[ManagingOfficerKey] as ManagingOfficerIndividual[])
    .map( moi => { return { ...moi, [ID]: uuidv4() }; } );
  appData[ManagingOfficerCorporateKey] = (appData[ManagingOfficerCorporateKey] as ManagingOfficerCorporate[])
    .map( moc => { return { ...moc, [ID]: uuidv4() }; } );

  appData[HasSoldLandKey] = '0';
  appData[IsSecureRegisterKey] = '0';
  appData[Transactionkey] = transactionId;
  appData[OverseasEntityKey] = overseaEntityId;

  if (Object.keys(appData[OverseasEntityDueDiligenceKey] as OverseasEntityDueDiligence).length) {
    appData[WhoIsRegisteringKey] =  WhoIsRegisteringType.SOMEONE_ELSE;
  } else if (Object.keys(appData[DueDiligenceKey] as DueDiligence).length){
    appData[WhoIsRegisteringKey] = WhoIsRegisteringType.AGENT;
  }
};

export const getAppDataFromAPI = async (req: Request): Promise<ApplicationData> => {
  let appData: ApplicationData = req.session?.getExtraData(APPLICATION_DATA_KEY) || {};
  const transactionId = appData[Transactionkey] || "";
  const overseaEntityId = appData[OverseasEntityKey] || "";
  appData = await getOverseasEntity(req, transactionId, overseaEntityId);
  setDefaultRegistrationValues(appData, transactionId, overseaEntityId);
  return appData;
};
