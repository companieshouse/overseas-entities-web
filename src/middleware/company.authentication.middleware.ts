import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL, OVERSEAS_ENTITY_PRESENTER_URL } from '../config';
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { EntityNumberKey } from "../model/data.types.model";
import { SignInInfoKeys } from '@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys';
import { ISignInInfo } from '@companieshouse/node-session-handler/lib/session/model/SessionInterfaces';
import { SessionKey } from '@companieshouse/node-session-handler/lib/session/keys/SessionKey';

export const companyAuthentication = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `Company Authentication Request`);

    const appData: ApplicationData = getApplicationData(req.session);
    const entityNumber: string = appData?.[EntityNumberKey] as string;
    const signInInfo: ISignInInfo = req.session?.get<ISignInInfo>(SessionKey.SignInInfo) || {};

    if (entityNumber) {
      if (!isAuthorisedForCompany(entityNumber, signInInfo)) {
        const authMiddlewareConfig: AuthOptions = {
          chsWebUrl: CHS_URL,
          returnUrl: OVERSEAS_ENTITY_PRESENTER_URL,
          companyNumber: entityNumber
        };
        logger.infoRequest(req, `Invoking company authentication with (${ entityNumber }) present in session`);
        return authMiddleware(authMiddlewareConfig)(req, res, next);
      }
      next();
    } else {
      logger.errorRequest(req, "No entity number to authenticate against");
      throw new Error("OE number not found in session");
    }
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};

function isAuthorisedForCompany(companyNumber: string, signInInfo: ISignInInfo): boolean {
  const authorisedCompany = signInInfo[SignInInfoKeys.CompanyNumber];
  if (!authorisedCompany) {
    return false;
  }
  return authorisedCompany.localeCompare(companyNumber) === 0;
}
