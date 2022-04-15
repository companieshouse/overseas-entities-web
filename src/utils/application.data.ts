import { Session } from '@companieshouse/node-session-handler';
import {
  ApplicationData,
  APPLICATION_DATA_KEY,
  ApplicationDataType,
  ApplicationDataArrayType,
  dataType,
} from "../model";

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

  return session?.setExtraData(APPLICATION_DATA_KEY, appData);
};

export const prepareData = (data: any, keys: string[]): ApplicationDataType => {
  return keys.reduce((o, key) => Object.assign(o, { [key]: data[key] }), {});
};

export const mapObjectFieldToAddress = (data: any, keys: string[]) => {
  return keys.reduce((o, key, i) => Object.assign(o, { [dataType.AddressKeys[i]]: data[key] }), {});
};

export const mapAddressToObjectField = (data: any, keys: string[]) => {
  return keys.reduce((o, key, i) => Object.assign(o, { [key]: data[dataType.AddressKeys[i]] }), {});
};
