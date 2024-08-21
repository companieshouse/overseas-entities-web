import { NextFunction, Request, Response } from "express";
import { checkActiveBOExists, checkActiveMOExists, getApplicationData, hasAddedOrCeasedBO } from "../utils/application.data";

import {
  UPDATE_CHECK_YOUR_ANSWERS_URL,
  UPDATE_REVIEW_STATEMENT_URL,
  SECURE_UPDATE_FILTER_URL,
  REMOVE_CONFIRM_STATEMENT_URL,
} from '../config';
import { BeneficialOwnerStatementKey, BeneficialOwnersStatementType } from "../model/beneficial.owner.statement.model";
import { ApplicationData } from "../model";
import { ErrorMessages } from "../validation/error.messages";
import { Session } from "@companieshouse/node-session-handler";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";
import { yesNoResponse } from "../model/data.types.model";
import { isRemoveJourney } from "../utils/url";
import { isNoChangeJourney } from "../utils/update/no.change.journey";

export const statementValidationErrorsGuard = (req: Request, res: Response, next: NextFunction) => {
  const hasStatementErrors = req['statementErrorList']?.length;

  if (hasStatementErrors) {
    return next();
  }

  if (isRemoveJourney(req)) {
    return res.redirect(REMOVE_CONFIRM_STATEMENT_URL);
  }

  const appData: ApplicationData = getApplicationData(req.session as Session);
  const redirectUrl = isNoChangeJourney(appData) ? UPDATE_REVIEW_STATEMENT_URL : UPDATE_CHECK_YOUR_ANSWERS_URL;

  return res.redirect(redirectUrl);
};

export const summaryPagesGuard = (req: Request, res: Response, next: NextFunction) => {
  const hasStatementErrors = req['statementErrorList']?.length;

  if (!hasStatementErrors) {
    return next();
  }

  return res.redirect(SECURE_UPDATE_FILTER_URL);
};

export const validateStatements = (req: Request, _: Response, next: NextFunction) => {

  const appData: ApplicationData = getApplicationData(req.session as Session);
  const errorList: string[] = [];

  const identifiedBOStatement = appData[BeneficialOwnerStatementKey];

  const allBOsIdentified = identifiedBOStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS;
  const allOrSomeBOsIdentified = identifiedBOStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS || identifiedBOStatement === BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS;
  const someOrNoneBOsIdentified = identifiedBOStatement === BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS || identifiedBOStatement === BeneficialOwnersStatementType.NONE_IDENTIFIED;

  if (allBOsIdentified && checkActiveMOExists(appData)) {
    errorList.push(ErrorMessages.ACTIVE_MO);
  }

  if (allOrSomeBOsIdentified && !checkActiveBOExists(appData)) {
    errorList.push(ErrorMessages.NO_ACTIVE_REGISTRABLE_BO);
  }

  if (!allOrSomeBOsIdentified && checkActiveBOExists(appData)) {
    errorList.push(ErrorMessages.ACTIVE_REGISTRABLE_BO);
  }

  if (someOrNoneBOsIdentified && !checkActiveMOExists(appData)) {
    errorList.push(ErrorMessages.NO_ACTIVE_MO);
  }

  const ceasedOrBecomeBOStatement = appData.update?.[RegistrableBeneficialOwnerKey];

  const someoneCeasedOrBecomeBO = ceasedOrBecomeBOStatement === yesNoResponse.Yes;

  if (someoneCeasedOrBecomeBO && !hasAddedOrCeasedBO(appData)) {
    errorList.push(ErrorMessages.NOT_ADDED_OR_CEASED_BO);
  }

  if (!someoneCeasedOrBecomeBO && hasAddedOrCeasedBO(appData)) {
    errorList.push(ErrorMessages.ADDED_OR_CEASED_BO);
  }

  req['statementErrorList'] = errorList;
  next();
};
