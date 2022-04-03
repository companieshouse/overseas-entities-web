import { Session } from '@companieshouse/node-session-handler';
import { ApplicationData, APPLICATION_DATA_KEY, ApplicationDataType } from '../model';

export const getApplicationData = (session: Session | undefined): ApplicationData => {
  return session?.getExtraData(APPLICATION_DATA_KEY) || {} as ApplicationData;
};

export const setApplicationData = (session: Session | undefined, data: any, key: string): undefined | void => {
  const arrTypeObj = ["beneficialOwnerOther", "beneficialOwnerIndividual", "managingOfficerCorporate", "managingOfficer"];
  let appData: ApplicationData = getApplicationData(session);

  if (arrTypeObj.includes(key)){
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

export const removeFromApplicationData = (session: Session | undefined, key: string, index: number): undefined | void => {
  const appData: ApplicationData = getApplicationData(session);
  appData[key].splice(index, 1);
  return session?.setExtraData(APPLICATION_DATA_KEY, appData);
};

export const getFromApplicationData = (session: Session | undefined, key: string, index: number) => {
  const appData: ApplicationData = getApplicationData(session);

  return ( index !== undefined && appData && appData[key] && appData[key][index] )
    ? appData[key][index]
    : {};
};
