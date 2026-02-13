import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model/application.model";
import { isNoChangeJourney } from "../../utils/update/no.change.journey";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { fetchApplicationData } from "../../utils/application.data";
import { FormattedValidationErrors, formatValidationError } from "../../middleware/validation.middleware";
import { StatementResolutionKey, StatementResolutionType } from "../../model/statement.resolution.model";

import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_WITH_PARAMS_URL,
  UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const inNoChangeJourney: boolean = isNoChangeJourney(appData);

    return renderPage(req, res, appData, inNoChangeJourney, req['statementErrorList']);

  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const errors = validationResult(req);
    const inNoChangeJourney = isNoChangeJourney(appData);

    if (!errors.isEmpty()) {
      return renderPage(req, res, appData, inNoChangeJourney, req['statementErrorList'], formatValidationError(errors.array()));
    }

    return req.body[StatementResolutionKey] === StatementResolutionType.CHANGE_INFORMATION
      ? res.redirect(getChangeInformationRedirectUrl(req, inNoChangeJourney))
      : res.redirect(identifiedBOStatement(req, inNoChangeJourney));
  } catch (error) {
    next(error);
  }
};

const renderPage = (req: Request, res: Response, appData: ApplicationData, inNoChangeJourney: boolean, statementErrorList: string[], errors?: FormattedValidationErrors) => (
  res.render(UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE, {
    ...appData,
    errors,
    statementErrorList,
    backLinkUrl: ceasedBOStatement(req, inNoChangeJourney),
    templateName: UPDATE_STATEMENT_VALIDATION_ERRORS_PAGE,
  })
);

const getChangeInformationRedirectUrl = (req: Request, inNoChangeJourney: boolean) => (
  inNoChangeJourney
    ? getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
    })
    : getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    })
);

const identifiedBOStatement = (req: Request, inNoChangeJourney: boolean) => (
  inNoChangeJourney
    ? getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL,
    })
    : getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
    })
);

const ceasedBOStatement = (req: Request, inNoChangeJourney: boolean) => (
  inNoChangeJourney
    ? getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
    })
    : getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
    })
);
