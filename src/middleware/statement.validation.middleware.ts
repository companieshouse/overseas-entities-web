import { NextFunction, Request, Response } from "express";
import { isActiveFeature } from "../utils/feature.flag";
import { checkActiveBOExists, getApplicationData, hasNotAddedOrCeasedBos } from "../utils/application.data";
import {
  FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION,
  UPDATE_CHECK_YOUR_ANSWERS_URL,
  UPDATE_REVIEW_STATEMENT_URL
} from '../config';
import { BeneficialOwnerStatementKey, BeneficialOwnersStatementType } from "../model/beneficial.owner.statement.model";
import { ApplicationData } from "../model";
import { ErrorMessages } from "../validation/error.messages";
import { Session } from "@companieshouse/node-session-handler";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";

export const hasValidStatements = (req: Request, res: Response, next: NextFunction) => {
  const errorList: string[] = [];
  const appData: ApplicationData = getApplicationData(req.session as Session);
  if (
    isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION) &&
    !checkStatementsValid(appData, errorList)
  ) {
    req['statementErrorList'] = errorList;
    return next();
  }

  const redirectUrl = appData.update?.no_change ? UPDATE_REVIEW_STATEMENT_URL : UPDATE_CHECK_YOUR_ANSWERS_URL;
  return res.redirect(redirectUrl);
};

const validateIdentifiedBOsStatement = (appData: ApplicationData, errorList: string[]): boolean => {
  const allOrSomeBOsIdentified: boolean = (appData[BeneficialOwnerStatementKey] === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS || appData[BeneficialOwnerStatementKey] === BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS);

  if (allOrSomeBOsIdentified && !checkActiveBOExists(appData)) {
    errorList.push(ErrorMessages.NO_ACTIVE_REGISTRABLE_BO);
    return false;
  }

  if (hasNotAddedOrCeasedBos(appData) && appData.update?.[RegistrableBeneficialOwnerKey] === 1) {
    errorList.push(ErrorMessages.NOT_ADDED_OR_CEASED_BO);
    return false;
  }

  if (!allOrSomeBOsIdentified && checkActiveBOExists(appData)) {
    errorList.push(ErrorMessages.ACTIVE_REGISTRABLE_BO);
    return false;
  }

  return true;
};

const checkStatementsValid = (appData: ApplicationData, errorList: string[]): boolean => {
  return validateIdentifiedBOsStatement(appData, errorList);
};
