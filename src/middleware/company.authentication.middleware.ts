import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import {
  CHS_URL,
  UPDATE_FILING_DATE_URL,
  RESUME,
  UPDATE_LANDING_URL,
  OVERSEAS_ENTITY_PRESENTER_URL,
  JOURNEY_REMOVE_QUERY_PARAM,
  RELEVANT_PERIOD_OWNED_LAND_FILTER_URL
} from '../config';
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { EntityNumberKey } from "../model/data.types.model";
import { getTransaction } from "../service/transaction.service";
import { isRemoveJourney } from "../utils/url";
import { isActiveFeature } from "../utils/feature.flag";
import * as config from "../config";

export const companyAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `Company Authentication Request`);
    const isRemove: boolean = await isRemoveJourney(req);

    const appData: ApplicationData = await getApplicationData(req.session);
    let entityNumber: string | undefined = appData?.[EntityNumberKey];
    let returnURL = !isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD) ? UPDATE_FILING_DATE_URL : RELEVANT_PERIOD_OWNED_LAND_FILTER_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
    if (isRemove) {
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
