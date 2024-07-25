import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import { logger } from "../../utils/logger";
import {
  UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE,
} from "../../config";
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model/application.model";
import { FormattedValidationErrors, formatValidationError } from "../../middleware/validation.middleware";
import { StatementResolutionKey, StatementResolutionType } from "../../model/statement.resolution.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const inNoChangeJourney = !!appData.update?.no_change;

    return renderPage(res, appData, inNoChangeJourney, req['statementErrorList']);
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const errors = validationResult(req);
    const inNoChangeJourney = !!appData.update?.no_change;

    if (!errors.isEmpty()) {
      return renderPage(res, appData, inNoChangeJourney, req['statementErrorList'], formatValidationError(errors.array()));
    }

    return req.body[StatementResolutionKey] === StatementResolutionType.CHANGE_INFORMATION
      ? res.redirect(getChangeInformationRedirectUrl(inNoChangeJourney))
      : res.redirect(identifiedBOStatement(inNoChangeJourney));
  } catch (error) {
    next(error);
  }
};

const renderPage = (res: Response, appData: ApplicationData, inNoChangeJourney: boolean, statementErrorList: string[], errors?: FormattedValidationErrors) => (
  res.render(UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE, {
    backLinkUrl: ceasedBOStatement(inNoChangeJourney),
    templateName: UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE,
    ...appData,
    statementErrorList,
    errors,
  })
);

const getChangeInformationRedirectUrl = (inNoChangeJourney: boolean) => (
  inNoChangeJourney
    ? UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL
    : UPDATE_BENEFICIAL_OWNER_TYPE_URL
);

const identifiedBOStatement = (inNoChangeJourney: boolean) => (
  inNoChangeJourney
    ? UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL
    : UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL
);

const ceasedBOStatement = (inNoChangeJourney: boolean) => (
  inNoChangeJourney
    ? UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL
    : UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL
);
