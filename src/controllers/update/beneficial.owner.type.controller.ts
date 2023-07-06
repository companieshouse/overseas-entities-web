import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice
} from "../../model/beneficial.owner.type.model";

import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { checkAndReviewBeneficialOwner } from "../../utils/update/review.beneficial.owner";
import { checkAndReviewManagingOfficers } from "../../utils/update/review.managing.officer";
import { ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { ManagingOfficerKey } from "../../model/managing.officer.model";
import { isActiveFeature } from "../../utils/feature.flag";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    const checkIsRedirect = checkAndReviewBeneficialOwner(appData);
    if (checkIsRedirect && checkIsRedirect !== "") {
      return res.redirect(checkIsRedirect);
    }

    const checkMoRedirect = checkAndReviewManagingOfficers(appData);
    if (checkMoRedirect){
      return res.redirect(checkMoRedirect);
    }

    const allBosMos = [
      ...(appData[BeneficialOwnerIndividualKey] ?? []),
      ...(appData[BeneficialOwnerOtherKey] ?? []),
      ...(appData[BeneficialOwnerGovKey] ?? []),
      ...(appData[ManagingOfficerCorporateKey] ?? []),
      ...(appData[ManagingOfficerKey] ?? [])
    ];

    const hasNewlyAddedBosMos = allBosMos.find(boMo => boMo.ch_reference === undefined) !== undefined;
    const hasExistingBosMos = allBosMos.find(boMo => boMo.ch_reference) !== undefined;

    return res.render(config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
      templateName: config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
      ...appData,
      hasExistingBosMos,
      hasNewlyAddedBosMos
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  return res.redirect(getNextPage(req.body[BeneficialOwnerTypeKey]));
};

export const postSubmit = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  const redirectUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_TRUSTS)
    ? config.UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL
    : config.UPDATE_CHECK_YOUR_ANSWERS_URL;

  return res.redirect(redirectUrl);
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
      default:
        return config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL;
  }
};
