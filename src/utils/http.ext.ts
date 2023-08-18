import { Response } from 'express';
import { REGISTER_AN_OVERSEAS_ENTITY_URL, UPDATE_AN_OVERSEAS_ENTITY_URL } from '../config';

export const safeRedirect = (res: Response, url: string): void => {
  if (url.startsWith(REGISTER_AN_OVERSEAS_ENTITY_URL) || url.startsWith(UPDATE_AN_OVERSEAS_ENTITY_URL)) {
    return res.redirect(url);
  }

  throw new Error('Security failure with URL ' + url);
};
