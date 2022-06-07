import { Session } from '@companieshouse/node-session-handler';
import { ID } from '../model/data.types.model';
import {
  ApplicationData,
  APPLICATION_DATA_KEY,
  ApplicationDataType,
  ApplicationDataArrayType
} from "../model";
import { createAndLogErrorRequest } from './logger';
import { Request } from "express";

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
  return htmlFields.reduce((o, key, i) => Object.assign(o, { [dataModelKeys[i]]: data[key] }), {});
};

export const mapDataObjectToFields = (data: any, htmlFields: string[], dataModelKeys: string[]) => {
  return htmlFields.reduce((o, key, i) => Object.assign(o, { [key]: data[dataModelKeys[i]] }), {});
};

export const removeFromApplicationData = (req: Request, key: string, id: string) => {
  const session = req.session;
  const appData: ApplicationData = getApplicationData(session);

  const index = getIndexInApplicationData(req, appData, key, id);
  if (index === -1) {
    throw createAndLogErrorRequest(req, `application.data removeFromApplicationData - unable to find object in session data for key ${key} and ID ${id}`);
  }
  appData[key].splice(index, 1);
  setExtraData(session, appData);
};

export const getFromApplicationData = (req: Request, key: string, id: string): any => {
  const appData: ApplicationData = getApplicationData(req.session);

  const index = getIndexInApplicationData(req, appData, key, id);
  if (index === -1) {
    throw createAndLogErrorRequest(req, `application.data getFromApplicationData - unable to find object in session data for key ${key} and ID ${id}`);
  }
  return appData[key][index];
};

const getIndexInApplicationData = (req: Request, appData: ApplicationData, key: string, id: string) => {
  if (id && appData && appData[key]) {
    return appData[key].findIndex(object => object[ID] === id);
  }
  throw createAndLogErrorRequest(req, `application.data getIndexInApplicationData - unable to find object in session data for key ${key} and ID ${id}`);
};
