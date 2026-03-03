import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { isActiveFeature } from "../../utils/feature.flag";
import { validationResult } from "express-validator/src/validation-result";
import { retrieveTrustData } from "../../utils/update/trust.model.fetch";
import { updateOverseasEntity } from "../../service/overseas.entities.service";
import { ManagingOfficerKey } from "../../model/managing.officer.model";
import { BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { checkAndReviewBeneficialOwner } from "../../utils/update/review.beneficial.owner";
import { checkAndReviewManagingOfficers } from "../../utils/update/review.managing.officer";

import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { fetchApplicationData, setExtraData } from "../../utils/application.data";
import { checkEntityRequiresTrusts, getTrustLandingUrl } from "../../utils/trusts";
import { FormattedValidationErrors, formatValidationError } from "../../middleware/validation.middleware";

import {
  hasTrustsToReview,
  moveReviewableTrustsIntoReview,
  resetReviewStatusOnAllTrustsToBeReviewed
} from "../../utils/update/review_trusts";

import {
  BeneficialOwnerTypeKey,
  BeneficialOwnerTypeChoice,
  ManagingOfficerTypeChoice,
} from "../../model/beneficial.owner.type.model";

type ReviewBaseUrls = {
  beneficialOwnerIndividual: string;
  beneficialOwnerGov: string;
  beneficialOwnerOther: string;
  managingOfficerIndividual: string;
  managingOfficerCorporate: string;
};

type BoMoBaseUrls = {
  confirmRemove: string;
} & ReviewBaseUrls;

type BeneficialOwnerTypePageProperties = {
  backLinkUrl: string;
  templateName: string;
  errors?: FormattedValidationErrors;
  hasExistingBosMos: boolean;
  hasNewlyAddedBosMos: boolean;
  reviewUrls: ReviewBaseUrls;
  boMoUrls: BoMoBaseUrls;
  boTypeSubmitUrl: string;
};

const getPageProperties = async (req: Request, errors?: FormattedValidationErrors,): Promise<BeneficialOwnerTypePageProperties> => {

  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, !isRemove);

  const allBosMos = [
    ...(appData[BeneficialOwnerIndividualKey] ?? []),
    ...(appData[BeneficialOwnerOtherKey] ?? []),
    ...(appData[BeneficialOwnerGovKey] ?? []),
    ...(appData[ManagingOfficerCorporateKey] ?? []),
    ...(appData[ManagingOfficerKey] ?? [])
  ];

  const hasNewlyAddedBosMos = allBosMos.find(boMo => !boMo.ch_reference) !== undefined;
  const hasExistingBosMos = allBosMos.find(boMo => boMo.ch_reference) !== undefined;

  const boTypeSubmitUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL,
  });

  const backLinkUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  });

  return {
    ...appData,
    hasExistingBosMos,
    hasNewlyAddedBosMos,
    errors,
    backLinkUrl,
    boTypeSubmitUrl,
    boMoUrls: getBoMoBaseUrls(req),
    reviewUrls: getReviewBaseUrls(req),
    templateName: config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
  };
};

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const checkIsRedirect = checkAndReviewBeneficialOwner(req as any, appData);

    if (checkIsRedirect && checkIsRedirect !== "") {
      return res.redirect(checkIsRedirect);
    }
    const checkMoRedirect = checkAndReviewManagingOfficers(req as any, appData);

    if (checkMoRedirect) {
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
  const errorList = validationResult(req);
  if (!errorList.isEmpty()) {
    const pageProps = await getPageProperties(req, formatValidationError(errorList.array()));
    return res.render(pageProps.templateName, pageProps);
  }
  return res.redirect(getNextPage(req));
};

export const postSubmit = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);

    if (!appData.update?.trust_data_fetched) {
      const session = req.session as Session;
      await retrieveTrustData(req, appData);
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
        await updateOverseasEntity(req, req.session as Session, appData);
      } else {
        await saveAndContinue(req, session);
      }
      setExtraData(req.session, appData);
    }

    // Move any trusts that have been reviewed back into review so user can review data again if
    // they have gone back to an earlier screen and changed something that might affect the trust.
    // If no trusts have been reviewed yet then no trusts should get moved by this
    moveReviewableTrustsIntoReview(appData);
    resetReviewStatusOnAllTrustsToBeReviewed(appData);

    if (hasTrustsToReview(appData)) {
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_MANAGE_TRUSTS_INTERRUPT_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_MANAGE_TRUSTS_INTERRUPT_URL,
      }));
    }

    if (checkEntityRequiresTrusts(appData)) {
      return res.redirect(getTrustLandingUrl(appData, req));
    }

    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
    }));

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getNextPage = (req: Request): string => {

  const boMoBaseUrls = getBoMoBaseUrls(req);

  switch (req.body[BeneficialOwnerTypeKey]) {

      case BeneficialOwnerTypeChoice.government:
        return boMoBaseUrls.beneficialOwnerGov;

      case BeneficialOwnerTypeChoice.otherLegal:
        return boMoBaseUrls.beneficialOwnerOther;

      case ManagingOfficerTypeChoice.corporate:
        return boMoBaseUrls.managingOfficerCorporate;

      case ManagingOfficerTypeChoice.individual:
        return boMoBaseUrls.managingOfficerIndividual;

      case BeneficialOwnerTypeChoice.relevantPeriodIndividual:
        return boMoBaseUrls.beneficialOwnerIndividual + config.RELEVANT_PERIOD_QUERY_PARAM;

      case BeneficialOwnerTypeChoice.relevantPeriodOtherLegal:
        return boMoBaseUrls.beneficialOwnerOther + config.RELEVANT_PERIOD_QUERY_PARAM;

      case BeneficialOwnerTypeChoice.relevantPeriodGovernment:
        return boMoBaseUrls.beneficialOwnerGov + config.RELEVANT_PERIOD_QUERY_PARAM;

      default:
        return boMoBaseUrls.beneficialOwnerIndividual;
  }
};

const getBoMoBaseUrls = (req: Request): BoMoBaseUrls => {
  return {
    beneficialOwnerIndividual: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL,
    }),
    beneficialOwnerGov: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_GOV_URL,
    }),
    beneficialOwnerOther: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_OTHER_URL,
    }),
    managingOfficerCorporate: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_MANAGING_OFFICER_CORPORATE_URL,
    }),
    managingOfficerIndividual: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_MANAGING_OFFICER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_MANAGING_OFFICER_URL,
    }),
    confirmRemove: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_CONFIRM_TO_REMOVE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_CONFIRM_TO_REMOVE_URL,
    }),
  };
};

const getReviewBaseUrls = (req: Request): ReviewBaseUrls => {
  return {
    beneficialOwnerIndividual: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL,
    }),
    beneficialOwnerGov: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL,
    }),
    beneficialOwnerOther: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_URL,
    }),
    managingOfficerIndividual: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL,
    }),
    managingOfficerCorporate: getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_URL,
    }),
  };
};
