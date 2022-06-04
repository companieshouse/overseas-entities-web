import { Session } from '@companieshouse/node-session-handler';
import { BeneficialOwnerNoc, ID, NonLegalFirmNoc, TrusteesNoc } from '../model/data.types.model';
import {
  ApplicationData,
  APPLICATION_DATA_KEY,
  ApplicationDataType,
  ApplicationDataArrayType
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

  return setExtraData(session, appData);
};

export const removeFromApplicationData = (session: Session | undefined, key: string, id: string | undefined) => {
  const appData: ApplicationData = getApplicationData(session);

  if (id && appData && appData[key]) {
    const index = appData[key].findIndex( object => object[ID] === id );

    if (index !== -1) {
      appData[key].splice(index, 1);
      setExtraData(session, appData);
    }
  }
};

export const getFromApplicationData = (session: Session | undefined, key: string, id: string | undefined) => {
  const appData: ApplicationData = getApplicationData(session);

  if (id && appData && appData[key]) {
    const index = appData[key].findIndex(object => object[ID] === id );

    return appData[key][index] || {};
  }

  return {};
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

export const mapNOCObjectToFields = (data: any) => {
  const beneficialOwnerNoc = (data[BeneficialOwnerNoc].length === 1) ? data[BeneficialOwnerNoc][0] : data[BeneficialOwnerNoc];
  const trusteesNoc = (data[TrusteesNoc].length === 1) ? data[TrusteesNoc][0] : data[TrusteesNoc];
  const nonLegalFirmNoc = (data[NonLegalFirmNoc].length === 1) ? data[NonLegalFirmNoc][0] : data[NonLegalFirmNoc];

  return {
    [BeneficialOwnerNoc]: beneficialOwnerNoc,
    [TrusteesNoc]: trusteesNoc,
    [NonLegalFirmNoc]: nonLegalFirmNoc
  };
};

