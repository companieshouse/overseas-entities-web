import { REGISTER_AN_OVERSEAS_ENTITY_URL } from '../config';

// Required for Sonar rule tssecurity:S5146 (this will never happen but Sonar can not understand middleware in this case)
export const isValidUrl = (url: string) => {
  if (url.startsWith(REGISTER_AN_OVERSEAS_ENTITY_URL)) {
    return true;
  }

  throw new Error('Security failure with URL ' + url);
};
