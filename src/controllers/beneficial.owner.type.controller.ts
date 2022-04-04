import { NextFunction, Request, Response } from "express";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType, beneficialOwnerTypeType } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { BeneficialOwnerType } from "../model/beneficial.owner.type.model";
import { BeneficialOwnerStatementChoice, BeneficialOwnerTypeChoice } from "../model/data.types.model";
import { BeneficialOwnerStatement } from "../model/beneficial.owner.statement.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const isBeneficialOwners: boolean = areBeneficialOwnersIdenitified(appData.beneficialOwnerStatement);

    return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_STATEMENTS_URL,
      ...appData.beneficialOwnerType,
      isBeneficialOwners
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const areBeneficialOwnersIdenitified = (statement: BeneficialOwnerStatement | undefined): boolean => {
  if (statement) {
    return statement.beneficialOwnerStatement ===  BeneficialOwnerStatementChoice.allIdentifiedAllSupplied ||
      statement.beneficialOwnerStatement ===  BeneficialOwnerStatementChoice.allIdentifiedSomeSupplied ||
      statement.beneficialOwnerStatement ===  BeneficialOwnerStatementChoice.someIdentifiedSomeDetails;
  }
  return false;
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, beneficialOwnerTypeType.BeneficialOwnerTypeKeys);
    setApplicationData(req.session, data, beneficialOwnerTypeType.BeneficialOwnerTypeKey);

    const beneficialOwnerTypeData: BeneficialOwnerType = data as BeneficialOwnerType;
    const nextPage: string = getNextPage(beneficialOwnerTypeData.beneficialOwnerType);
    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getNextPage = (beneficialOwnerTypeChoices?: BeneficialOwnerTypeChoice[]): string => {
  if (beneficialOwnerTypeChoices?.includes(BeneficialOwnerTypeChoice.individual)) {
    return config.BENEFICIAL_OWNER_INDIVIDUAL_URL;
  }
  if (beneficialOwnerTypeChoices?.includes(BeneficialOwnerTypeChoice.otherLegal)) {
    return config.BENEFICIAL_OWNER_OTHER_URL;
  }
  if (beneficialOwnerTypeChoices?.includes(BeneficialOwnerTypeChoice.none)) {
    return config.MANAGING_OFFICER_URL;
  }
  return config.BENEFICIAL_OWNER_TYPE_URL;
};
