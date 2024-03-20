import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import {
  CHS_URL,
  UPDATE_FILING_DATE_URL,
  RESUME,
  UPDATE_LANDING_URL,
  OVERSEAS_ENTITY_PRESENTER_URL,
  JOURNEY_REMOVE_QUERY_PARAM
} from '../config';
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { EntityNumberKey } from "../model/data.types.model";
import { getTransaction } from "../service/transaction.service";
import { isRemoveJourney } from "../utils/url";

export const companyAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `Company Authentication Request`);

    const appData: ApplicationData = getApplicationData(req.session);
    let entityNumber: string | undefined = appData?.[EntityNumberKey];
    let returnURL: string = UPDATE_FILING_DATE_URL;
    if (isRemoveJourney(req)) {
      logger.debugRequest(req, "Remove journey proceed directly to the presenter page");
      returnURL = `${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`;
    }

    if (req.path.endsWith(`/${RESUME}`)) {
      [entityNumber, returnURL] = await processTransaction(req);
    }

    if (entityNumber) {
      const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: CHS_URL,
        returnUrl: returnURL,
        companyNumber: entityNumber
      };
      logger.infoRequest(req, `Invoking company authentication with (${ entityNumber }) present in session`);
      return authMiddleware(authMiddlewareConfig)(req, res, next);
    } else {
      logger.errorRequest(req, "No entity number to authenticate against -- redirecting to start of Journey: " + UPDATE_LANDING_URL);
      return res.redirect(UPDATE_LANDING_URL);
    }
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};

async function processTransaction (req: Request): Promise<[string, string]> {
  const { transactionId } = req.params;

  if (transactionId) {
    const transactionResource = await getTransaction(req, transactionId);
    const entityNumberTransaction = transactionResource.companyNumber;

    if (entityNumberTransaction === undefined) {
      throw new Error("No company number in transaction to resume");
    }
    return [entityNumberTransaction, req.originalUrl];
  }

  throw new Error("Invalid transaction for resume");
}
