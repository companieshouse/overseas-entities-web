import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import {
  UPDATE_LANDING_URL,
  SOLD_LAND_FILTER_URL,
  RESUME,
  STARTING_NEW_URL,
  SECURE_UPDATE_FILTER_URL,
  UPDATE_CONTINUE_WITH_SAVED_FILING_URL
} from '../config';

import {
  checkUserSignedIn,
  getLoggedInUserEmail
} from "../utils/session";

export const authentication = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkUserSignedIn(req.session)) {
      logger.infoRequest(req, 'User not authenticated, redirecting to sign in page, status_code=302');

      const returnUrl = getAuthenticationReturnUrl(req);

      return res.redirect(`/signin?return_to=${returnUrl}`);
    }
    const userEmail = getLoggedInUserEmail(req.session);
    logger.infoRequest(req, `User (${ userEmail }) is signed in`);
    // Using the https://expressjs.com/en/5x/api.html#res.locals to make sure that the email
    // is available within a single request-response cycle and visible in the template.
    res.locals.userEmail = userEmail;
    next();

  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};

const validTransactionIdChars = (() => {
    const map: Map<string, string> = new Map();
    "1234567890-".split('').forEach(d => map.set(d, d));
    return map;
})();

const validOverseasEntityIdChars = (() => {
    const map: Map<string, string> = new Map();
    "1234567890abcdef".split('').forEach(d => map.set(d, d));
    return map;
})();

const validateId = (id: string, map: Map<string, string>) => {
  return id.split('').map(c => {
    return map.get(c);
    // Might want to throw an error rather than strip out but not needed for this testing
  }).join('');
};

const getAuthenticationReturnUrl = (req: Request): string => {
  let returnUrl = SOLD_LAND_FILTER_URL;

  if (req.path === STARTING_NEW_URL) {
    returnUrl = STARTING_NEW_URL;
  } else if (req.path === UPDATE_CONTINUE_WITH_SAVED_FILING_URL) {
    req.path = UPDATE_CONTINUE_WITH_SAVED_FILING_URL;
  } else if (req.path.endsWith(`/${RESUME}`)) {
    const path = req.path.split("/");
    // Format must be like /update-an-overseas-entity|register-an-overseas-entity/transaction/106689-484116-885660/overseas-entity/64a5793f07d57a177c5fbe6b/resume
    if (path.length !== 7 ||
      (path[1] !== "update-an-overseas-entity" && path[1] !== "register-an-overseas-entity") ||
      path[2] !== "transaction" || path[4] !== "overseas-entity") {
      throw Error("Invalid auth path");
    }
    const journey = path[1] === "update-an-overseas-entity" ? "update-an-overseas-entity" : "register-an-overseas-entity";
    const transactionId = validateId(path[3], validTransactionIdChars);
    const overseasEntityId = validateId(path[5], validOverseasEntityIdChars);
    returnUrl = `/${journey}/transaction/${transactionId}/overseas-entity/${overseasEntityId}/resume`;
  } else if (req.path.startsWith(UPDATE_LANDING_URL)) {
    returnUrl = SECURE_UPDATE_FILTER_URL;
  }
  return returnUrl;
};
