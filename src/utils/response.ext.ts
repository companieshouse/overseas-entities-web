import { Response } from 'express';
import { REGISTER_AN_OVERSEAS_ENTITY_URL } from '../config';

const safeRedirect = function (url: string) {
  if (url.startsWith(REGISTER_AN_OVERSEAS_ENTITY_URL)) {
    return (this! as Response).redirect(url);
  }

  throw new Error('Security failure with URL ' + url);
};

export {
  safeRedirect,
};
