import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../model";
import { ErrorMessages } from "../validation/error.messages";
import { yesNoResponse } from "../model/data.types.model";
import { isNoChangeJourney } from "../utils/update/no.change.journey";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";

import { getRedirectUrl, isRegistrationJourney, isRemoveJourney } from "../utils/url";

import {
  BeneficialOwnerStatementKey,
  BeneficialOwnersStatementType
} from "../model/beneficial.owner.statement.model";

import {
  checkActiveBOExists,
  checkActiveMOExists,
  hasAddedOrCeasedBO,
  fetchApplicationData,
} from "../utils/application.data";

import {
  UPDATE_CHECK_YOUR_ANSWERS_URL,
  UPDATE_REVIEW_STATEMENT_URL,
  SECURE_UPDATE_FILTER_URL,
  REMOVE_CONFIRM_STATEMENT_URL,
  UPDATE_REVIEW_STATEMENT_WITH_PARAMS_URL,
  UPDATE_CHECK_YOUR_ANSWERS_WITH_PARAMS_URL,
  SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
} from '../config';

export const statementValidationErrorsGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const hasStatementErrors = req['statementErrorList']?.length;

  if (hasStatementErrors) {
    return next();
  }

  const isRemove: boolean = await isRemoveJourney(req);

  if (isRemove) {
    return res.redirect(REMOVE_CONFIRM_STATEMENT_URL);
  }

  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

  const redirectUrl = isNoChangeJourney(appData)
    ? getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_REVIEW_STATEMENT_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_REVIEW_STATEMENT_URL,
    }) : getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_CHECK_YOUR_ANSWERS_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_CHECK_YOUR_ANSWERS_URL,
    });
  return res.redirect(redirectUrl);
};

export const summaryPagesGuard = (req: Request, res: Response, next: NextFunction) => {
  const hasStatementErrors = req['statementErrorList']?.length;
  if (!hasStatementErrors) {
    return next();
  }
  return res.redirect(getRedirectUrl({
    req,
    urlWithEntityIds: SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
    urlWithoutEntityIds: SECURE_UPDATE_FILTER_URL,
  }));
};

export const validateStatements = async (req: Request, _: Response, next: NextFunction): Promise<void> => {

  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
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
