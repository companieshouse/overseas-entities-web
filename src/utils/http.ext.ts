import { Response } from 'express';
import { REGISTER_AN_OVERSEAS_ENTITY_URL } from '../config';

const safeRedirect = (res: Response, url: string): void => {
  if (url.startsWith(REGISTER_AN_OVERSEAS_ENTITY_URL)) {
    return res.redirect(url);
  }

  throw new Error('Security failure with URL ' + url);
};

const safeRedirect2 = (res: Response, url: string): void => {
  if (url.startsWith("TEST-" + REGISTER_AN_OVERSEAS_ENTITY_URL)) {
    return res.redirect(url);
  }

  throw new Error('Security failure with URL ' + url);
};

export {
  safeRedirect,
  safeRedirect2,
};
