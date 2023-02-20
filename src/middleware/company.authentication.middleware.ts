import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL, OVERSEAS_ENTITY_PRESENTER_URL } from '../config';
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { EntityNumberKey } from "../model/data.types.model";

export const companyAuthentication = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `COMPANY AUTHENTICATION REQUEST`);

    const appData: ApplicationData = getApplicationData(req.session);
    const entityNumber: string = appData?.[EntityNumberKey] as string;

    if (entityNumber) {
      const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: CHS_URL,
        returnUrl: OVERSEAS_ENTITY_PRESENTER_URL,
        companyNumber: entityNumber
      };
      logger.infoRequest(req, `Invoking company authentication with (${ entityNumber }) present in session`);
      return authMiddleware(authMiddlewareConfig)(req, res, next);
    } else {
      logger.errorRequest(req, "No entity number to authenticate against");
      throw new Error(`OE number not found in session "${ entityNumber }"`);
    }
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};
