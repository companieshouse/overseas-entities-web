import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../utils/logger";
import { getTodaysDate } from "./date";
import { ApplicationData } from "../model";
import { isActiveFeature } from "../utils/feature.flag";
import { closeTransaction } from "../service/transaction.service";
import { getApplicationData } from "../utils/application.data";
import { RoleWithinTrustType } from "../model/role.within.trust.type.model";
import { startPaymentsSession } from "../service/payment.service";
import { checkRPStatementsExist } from "./relevant.period";
import { relevantPeriodStatementsState } from "../controllers/update/confirm.overseas.entity.details.controller";
import { fetchOverseasEntityEmailAddress } from "./update/fetch.overseas.entity.email";
import { getRedirectUrl, isRemoveJourney } from "./url";
import { fetchBeneficialOwnersPrivateData } from "./update/fetch.beneficial.owners.private.data";
import { fetchManagingOfficersPrivateData } from "./update/fetch.managing.officers.private.data";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { checkEntityRequiresTrusts, checkEntityReviewRequiresTrusts } from "./trusts";

import {
  CHS_URL,
  JourneyType,
  WHO_IS_MAKING_UPDATE_URL,
  UPDATE_REVIEW_STATEMENT_PAGE,
  REMOVE_CONFIRM_STATEMENT_URL,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  FEATURE_FLAG_ENABLE_TRUSTS_WEB,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE,
  OVERSEAS_ENTITY_SECTION_HEADING,
  OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
  WHO_IS_MAKING_UPDATE_WITH_PARAMS_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  REMOVE_CONFIRM_STATEMENT_WITH_PARAMS_URL,
  OVERSEAS_ENTITY_UPDATE_DETAILS_WITH_PARAMS_URL,
  FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_WITH_PARAMS_URL,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
} from "../config";

export const getDataForReview = async (req: Request, res: Response, next: NextFunction, isNoChangeJourney: boolean) => {

  const session = req.session as Session;
  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = await getApplicationData(req);
  const hasAnyBosWithTrusteeNocs = isNoChangeJourney ? checkEntityReviewRequiresTrusts(appData) : checkEntityRequiresTrusts(appData);
  const backLinkUrl = getBackLinkUrl(req, isNoChangeJourney, hasAnyBosWithTrusteeNocs, isRemove);
  const templateName = getTemplateName(isNoChangeJourney);
  const isRPStatementExists = checkRPStatementsExist(appData);
  const relevantPeriodStatements: boolean = relevantPeriodStatementsState.has_answered_relevant_period_question;

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (isNoChangeJourney) {
      await fetchBeneficialOwnersPrivateData(appData, req);
      await fetchManagingOfficersPrivateData(appData, req);
      await fetchOverseasEntityEmailAddress(appData, req, session);
    }

    const changeLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: OVERSEAS_ENTITY_UPDATE_DETAILS_WITH_PARAMS_URL,
      urlWithoutEntityIds: OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
    });

    const whoIsCompletingChangeLink = getRedirectUrl({
      req,
      urlWithEntityIds: WHO_IS_MAKING_UPDATE_WITH_PARAMS_URL,
      urlWithoutEntityIds: WHO_IS_MAKING_UPDATE_URL,
    });

    if (isRemove) {
      return res.render(templateName, {
        ...appData,
        backLinkUrl,
        templateName,
        changeLinkUrl,
        whoIsCompletingChangeLink,
        journey: JourneyType.remove,
        roleTypes: RoleWithinTrustType,
        overseasEntityHeading: OVERSEAS_ENTITY_SECTION_HEADING,
        pageParams: {
          isRemove: true,
          isRegistration: false,
          today: getTodaysDate(),
          hasAnyBosWithTrusteeNocs,
          noChangeFlag: isNoChangeJourney,
          isTrustFeatureEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_TRUSTS_WEB),
        },
        FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
      });
    }

    return res.render(templateName, {
      ...appData,
      backLinkUrl,
      templateName,
      changeLinkUrl,
      whoIsCompletingChangeLink,
      roleTypes: RoleWithinTrustType,
      overseasEntityHeading: OVERSEAS_ENTITY_SECTION_HEADING,
      pageParams: {
        isRegistration: false,
        hasAnyBosWithTrusteeNocs,
        noChangeFlag: isNoChangeJourney,
        isRPStatementExists: isRPStatementExists,
        no_change: appData.update?.no_change ?? "",
        relevantPeriodStatements: relevantPeriodStatements,
        isTrustFeatureEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_TRUSTS_WEB),
      },
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postDataForReview = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = await getApplicationData(req);
    const noChangeReviewStatement = req.body["no_change_review_statement"];

    if (noChangeReviewStatement === "0") {
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
      }));
    }

    const transactionID = appData[Transactionkey] as string;
    const overseasEntityID = appData[OverseasEntityKey] as string;
    const transactionClosedResponse = await closeTransaction(req, session, transactionID, overseasEntityID);
    const baseURL = `${CHS_URL}${UPDATE_AN_OVERSEAS_ENTITY_URL}`;

    logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);

    const redirectPath = await startPaymentsSession(
      req,
      session,
      transactionID,
      overseasEntityID,
      transactionClosedResponse,
      baseURL
    );

    logger.infoRequest(req, `Payments Session created with, Trans_ID: ${transactionID}, OE_ID: ${overseasEntityID}. Redirect to: ${redirectPath}`);

    return res.redirect(redirectPath);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getBackLinkUrl = (req: Request, isNoChangeJourney: boolean, hasAnyBosWithTrusteeNocs: boolean, isRemove: boolean) => {
  const isRemoveConfirmUrl = getRedirectUrl({
    req,
    urlWithEntityIds: REMOVE_CONFIRM_STATEMENT_WITH_PARAMS_URL,
    urlWithoutEntityIds: REMOVE_CONFIRM_STATEMENT_URL,
  });
  if (isNoChangeJourney) {
    return getNoChangeBackLinkUrl(req, isRemove, isRemoveConfirmUrl);
  } else {
    return getChangeBackLinkUrl(req, isRemove, isRemoveConfirmUrl);
  }
};

const getChangeBackLinkUrl = (req: Request, isRemove: boolean, isRemoveConfirmUrl: string) => {
  if (isRemove) {
    return isRemoveConfirmUrl;
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
    });
  }
};

const getNoChangeBackLinkUrl = (req: Request, isRemove: boolean, isRemoveConfirmUrl: string) => {
  if (isRemove) {
    return isRemoveConfirmUrl;
  }
  return getRedirectUrl({
    req,
    urlWithEntityIds: UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
    urlWithoutEntityIds: UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  });
};

const getTemplateName = (isNoChangeJourney: boolean) => (
  isNoChangeJourney
    ? UPDATE_REVIEW_STATEMENT_PAGE
    : UPDATE_CHECK_YOUR_ANSWERS_PAGE
);
