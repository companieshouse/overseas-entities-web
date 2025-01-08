import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { isActiveFeature } from "../utils/feature.flag";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { closeTransaction } from "../service/transaction.service";
import { startPaymentsSession } from "../service/payment.service";
import { fetchOverseasEntityEmailAddress } from "./update/fetch.overseas.entity.email";
import { fetchBeneficialOwnersPrivateData } from "./update/fetch.beneficial.owners.private.data";
import { RoleWithinTrustType } from "../model/role.within.trust.type.model";
import { fetchManagingOfficersPrivateData } from "./update/fetch.managing.officers.private.data";
import { getTodaysDate } from "./date";
import { checkRPStatementsExist } from "./relevant.period";
import { fetchApplicationData } from "../utils/application.data";

import { isRegistrationJourney, isRemoveJourney } from "./url";
import { checkEntityRequiresTrusts, checkEntityReviewRequiresTrusts } from "./trusts";

import {
  CHS_URL,
  JourneyType,
  WHO_IS_MAKING_UPDATE_URL,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  FEATURE_FLAG_ENABLE_TRUSTS_WEB,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE,
  UPDATE_REVIEW_STATEMENT_PAGE,
  REMOVE_CONFIRM_STATEMENT_URL,
  OVERSEAS_ENTITY_SECTION_HEADING,
  OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
} from "../config";

export const getDataForReview = async (req: Request, res: Response, next: NextFunction, isNoChangeJourney: boolean) => {

  const session = req.session as Session;
  const isRemove: boolean = await isRemoveJourney(req);
  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
  const hasAnyBosWithTrusteeNocs = isNoChangeJourney ? checkEntityReviewRequiresTrusts(appData) : checkEntityRequiresTrusts(appData);
  const backLinkUrl = getBackLinkUrl(isNoChangeJourney, hasAnyBosWithTrusteeNocs, isRemove);
  const templateName = getTemplateName(isNoChangeJourney);
  const isRPStatementExists = checkRPStatementsExist(appData);

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (isNoChangeJourney) {
      await fetchBeneficialOwnersPrivateData(appData, req);
      await fetchManagingOfficersPrivateData(appData, req);
      await fetchOverseasEntityEmailAddress(appData, req, session);
    }

    if (isRemove) {
      return res.render(templateName, {
        journey: JourneyType.remove,
        backLinkUrl,
        templateName,
        changeLinkUrl: OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
        overseasEntityHeading: OVERSEAS_ENTITY_SECTION_HEADING,
        whoIsCompletingChangeLink: WHO_IS_MAKING_UPDATE_URL,
        roleTypes: RoleWithinTrustType,
        ...appData,
        pageParams: {
          isRegistration: false,
          isRemove: true,
          noChangeFlag: isNoChangeJourney,
          isTrustFeatureEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_TRUSTS_WEB),
          hasAnyBosWithTrusteeNocs,
          today: getTodaysDate()
        },
        FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
      });
    }

    return res.render(templateName, {
      backLinkUrl,
      templateName,
      changeLinkUrl: OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
      overseasEntityHeading: OVERSEAS_ENTITY_SECTION_HEADING,
      whoIsCompletingChangeLink: WHO_IS_MAKING_UPDATE_URL,
      roleTypes: RoleWithinTrustType,
      ...appData,
      pageParams: {
        isRegistration: false,
        isRPStatementExists: isRPStatementExists,
        noChangeFlag: isNoChangeJourney,
        isTrustFeatureEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_TRUSTS_WEB),
        hasAnyBosWithTrusteeNocs,
        no_change: appData.update?.no_change ?? ""
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
    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    const noChangeReviewStatement = req.body["no_change_review_statement"];

    if (noChangeReviewStatement === "0") {
      return res.redirect(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
    }

    const transactionID = appData[Transactionkey] as string;
    const overseasEntityID = appData[OverseasEntityKey] as string;
    const transactionClosedResponse = await closeTransaction(req, session, transactionID, overseasEntityID);
    logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);
    const baseURL = `${CHS_URL}${UPDATE_AN_OVERSEAS_ENTITY_URL}`;

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

const getBackLinkUrl = (isNoChangeJourney: boolean, hasAnyBosWithTrusteeNocs: boolean, isRemove: boolean) => {
  if (isNoChangeJourney) {
    if (isRemove) {
      return REMOVE_CONFIRM_STATEMENT_URL;
    }
    return UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL;
  } else {
    let backLinkUrl: string;
    if (isRemove) {
      backLinkUrl = REMOVE_CONFIRM_STATEMENT_URL;
    } else {
      backLinkUrl = UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL;
    }
    return backLinkUrl;
  }
};

const getTemplateName = (isNoChangeJourney: boolean) => (
  isNoChangeJourney ? UPDATE_REVIEW_STATEMENT_PAGE : UPDATE_CHECK_YOUR_ANSWERS_PAGE
);

