import { Session } from '@companieshouse/node-session-handler';
import { ApplicationData, APPLICATION_DATA_KEY, ApplicationDataType } from '../model';

export const getApplicationData = (session: Session | undefined): ApplicationData => {
  return session?.getExtraData(APPLICATION_DATA_KEY) || {} as ApplicationData;
};

export const setApplicationData = (session: Session | undefined, data: any, key: string) => {
  let appData: ApplicationData = getApplicationData(session);
  appData = { ...appData, [key]: { ...data } } as ApplicationData;
  session?.setExtraData(APPLICATION_DATA_KEY, appData);
};

export const prepareData = (data: any, keys: string[]): ApplicationDataType => {
  return keys.reduce((o, key) => Object.assign(o, { [key]: data[key] }), {});
};
