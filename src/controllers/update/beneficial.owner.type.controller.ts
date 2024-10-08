import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice
} from "../../model/beneficial.owner.type.model";

import { getApplicationData, setExtraData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { checkAndReviewBeneficialOwner } from "../../utils/update/review.beneficial.owner";
import { checkAndReviewManagingOfficers } from "../../utils/update/review.managing.officer";
import { ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { ManagingOfficerKey } from "../../model/managing.officer.model";
import { hasTrustsToReview, moveReviewableTrustsIntoReview, resetReviewStatusOnAllTrustsToBeReviewed } from "../../utils/update/review_trusts";
import { checkEntityRequiresTrusts, getTrustLandingUrl } from "../../utils/trusts";
import { retrieveTrustData } from "../../utils/update/trust.model.fetch";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from "@companieshouse/node-session-handler";
import { validationResult } from "express-validator/src/validation-result";
import { FormattedValidationErrors, formatValidationError } from "../../middleware/validation.middleware";

type BeneficialOwnerTypePageProperties = {
  backLinkUrl: string;
  templateName: string;
  errors?: FormattedValidationErrors;
  hasExistingBosMos: boolean;
  hasNewlyAddedBosMos: boolean;
};

const getPageProperties = async (
  req: Request,
  errors?: FormattedValidationErrors,
): Promise<BeneficialOwnerTypePageProperties> => {
  const appData: ApplicationData = await getApplicationData(req.session);

  const allBosMos = [
    ...(appData[BeneficialOwnerIndividualKey] ?? []),
    ...(appData[BeneficialOwnerOtherKey] ?? []),
    ...(appData[BeneficialOwnerGovKey] ?? []),
    ...(appData[ManagingOfficerCorporateKey] ?? []),
    ...(appData[ManagingOfficerKey] ?? [])
  ];

  const hasNewlyAddedBosMos = allBosMos.find(boMo => !boMo.ch_reference) !== undefined;
  const hasExistingBosMos = allBosMos.find(boMo => boMo.ch_reference) !== undefined;

  return {
    backLinkUrl: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
    hasNewlyAddedBosMos,
    hasExistingBosMos,
    ...appData,
    errors
  };
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req.session);

    const checkIsRedirect = checkAndReviewBeneficialOwner(appData);
    if (checkIsRedirect && checkIsRedirect !== "") {
      return res.redirect(checkIsRedirect);
    }

    const checkMoRedirect = checkAndReviewManagingOfficers(appData);
    if (checkMoRedirect){
      return res.redirect(checkMoRedirect);
    }

    const pageProps = await getPageProperties(req);

    return res.render(pageProps.templateName, pageProps);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  //  check on errors
  const errorList = validationResult(req);

  if (!errorList.isEmpty()) {
    const pageProps = await getPageProperties(req, formatValidationError(errorList.array()));

    return res.render(pageProps.templateName, pageProps);
  }
  return res.redirect(getNextPage(req.body[BeneficialOwnerTypeKey]));
};

export const postSubmit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req.session);

    if (!appData.update?.trust_data_fetched) {
      const session = req.session as Session;
      await retrieveTrustData(req, appData);
      setExtraData(req.session, appData);
      await saveAndContinue(req, session);
    }

    // Move any trusts that have been reviewed back into review so user can review data again if
    // they have gone back to an earlier screen and changed something that might affect the trust.
    // If no trusts have been reviewed yet then no trusts should get moved by this
    moveReviewableTrustsIntoReview(appData);
    resetReviewStatusOnAllTrustsToBeReviewed(appData);

    if (hasTrustsToReview(appData)) {
      return res.redirect(config.UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
    }

    if (checkEntityRequiresTrusts(appData)) {
      return res.redirect(getTrustLandingUrl(appData));
    }

    return res.redirect(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getNextPage = (beneficialOwnerTypeChoices: BeneficialOwnerTypeChoice | ManagingOfficerTypeChoice): string => {
  switch (beneficialOwnerTypeChoices) {
      case BeneficialOwnerTypeChoice.government:
        return config.UPDATE_BENEFICIAL_OWNER_GOV_URL;
      case BeneficialOwnerTypeChoice.otherLegal:
        return config.UPDATE_BENEFICIAL_OWNER_OTHER_URL;
      case ManagingOfficerTypeChoice.corporate:
        return config.UPDATE_MANAGING_OFFICER_CORPORATE_URL;
      case ManagingOfficerTypeChoice.individual:
        return config.UPDATE_MANAGING_OFFICER_URL;
      case BeneficialOwnerTypeChoice.relevantPeriodIndividual:
        return config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
      case BeneficialOwnerTypeChoice.relevantPeriodOtherLegal:
        return config.UPDATE_BENEFICIAL_OWNER_OTHER_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
      case BeneficialOwnerTypeChoice.relevantPeriodGovernment:
        return config.UPDATE_BENEFICIAL_OWNER_GOV_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
      default:
        return config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL;
  }
};
