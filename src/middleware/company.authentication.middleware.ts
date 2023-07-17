import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL, UPDATE_FILING_DATE_URL } from '../config';
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { EntityNumberKey } from "../model/data.types.model";
import { getTransaction } from "../service/transaction.service";

export const companyAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `Company Authentication Request`);

    const appData: ApplicationData = getApplicationData(req.session);
    let entityNumber: string = appData?.[EntityNumberKey] as string;
    let returnURL: string = UPDATE_FILING_DATE_URL;

    if (req.path.match(/resume/)) {
      const { transactionId } = req.params;

      if (transactionId) {
        const transactionResource = await getTransaction(req, transactionId);
        const entityNumberTransaction = transactionResource.companyNumber as string;

        if (!entityNumber || entityNumberTransaction && entityNumber !== entityNumberTransaction) {
          entityNumber = entityNumberTransaction;
          returnURL = req.originalUrl;
        }
      } else {
        logger.errorRequest(req, "Invalid transactionId");
        throw new Error("Invalid transaction");
      }
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
      logger.errorRequest(req, "No entity number to authenticate against");
      throw new Error("OE number not found in session");
    }
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};
