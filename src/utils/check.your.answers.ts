import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import { Session } from "@companieshouse/node-session-handler";

import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { isActiveFeature } from "../utils/feature.flag";
import { createOverseasEntity } from "../service/overseas.entities.service";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { closeTransaction, postTransaction } from "../service/transaction.service";
import { startPaymentsSession } from "../service/payment.service";
import { checkEntityRequiresTrusts, checkEntityReviewRequiresTrusts } from "./trusts";
import { fetchOverseasEntityEmailAddress } from "./update/fetch.overseas.entity.email";
import { fetchBeneficialOwnersPrivateData } from "./update/fetch.beneficial.owners.private.data";

import {
  OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
  OVERSEAS_ENTITY_SECTION_HEADING,
  WHO_IS_MAKING_UPDATE_URL,
  FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  CHS_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  FEATURE_FLAG_ENABLE_TRUSTS_WEB,
  FEATURE_FLAG_ENABLE_UPDATE_TRUSTS,
  UPDATE_CHECK_YOUR_ANSWERS_PAGE,
  UPDATE_REVIEW_STATEMENT_PAGE,
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  JourneyType,
  REMOVE_CONFIRM_STATEMENT_URL,
  FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS,
} from "../config";
import { RoleWithinTrustType } from "../model/role.within.trust.type.model";
import { fetchManagingOfficersPrivateData } from "./update/fetch.managing.officers.private.data";
import { isRemoveJourney } from "./url";
import { getTodaysDate } from "./date";

export const getDataForReview = async (req: Request, res: Response, next: NextFunction, isNoChangeJourney: boolean) => {
  console.log("*********** isNoChangeJourney = " + isNoChangeJourney);
  const session = req.session as Session;
  const appData = getApplicationData(session);
  const hasAnyBosWithTrusteeNocs = isNoChangeJourney ? checkEntityReviewRequiresTrusts(appData) : checkEntityRequiresTrusts(appData);
  console.log("*********** hasAnyBosWithTrusteeNocs = " + hasAnyBosWithTrusteeNocs);

  const backLinkUrl = getBackLinkUrl(isNoChangeJourney, hasAnyBosWithTrusteeNocs, isRemoveJourney(req));
  const templateName = getTemplateName(isNoChangeJourney);

  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (isNoChangeJourney) {

      await fetchBeneficialOwnersPrivateData(appData, req);

      await fetchManagingOfficersPrivateData(appData, req);

      await fetchOverseasEntityEmailAddress(appData, req, session);

    }

    if (isRemoveJourney(req)) {
      return res.render(templateName, {
        journey: JourneyType.remove,
        backLinkUrl: backLinkUrl,
        templateName: templateName,
        changeLinkUrl: OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
        overseasEntityHeading: OVERSEAS_ENTITY_SECTION_HEADING,
        whoIsCompletingChangeLink: WHO_IS_MAKING_UPDATE_URL,
        roleTypes: RoleWithinTrustType,
        appData,
        pageParams: {
          isRegistration: false,
          isRemove: true,
          noChangeFlag: isNoChangeJourney,
          isTrustFeatureEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_TRUSTS_WEB),
          hasAnyBosWithTrusteeNocs,
          today: getTodaysDate(),
          addTrustsEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_TRUSTS),
          manageTrustsEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS)
        },
      });
    }

    const isTrustFeatureEnabled = isActiveFeature(FEATURE_FLAG_ENABLE_TRUSTS_WEB);
    console.log("*********** isTrustFeatureEnabled = " + isTrustFeatureEnabled);

    console.log("*********** rendering  = " + templateName);

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      changeLinkUrl: OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
      overseasEntityHeading: OVERSEAS_ENTITY_SECTION_HEADING,
      whoIsCompletingChangeLink: WHO_IS_MAKING_UPDATE_URL,
      roleTypes: RoleWithinTrustType,
      appData,
      pageParams: {
        isRegistration: false,
        noChangeFlag: isNoChangeJourney,
        isTrustFeatureEnabled,
        hasAnyBosWithTrusteeNocs,
        addTrustsEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_TRUSTS),
        manageTrustsEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS)
      },
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
    const appData: ApplicationData = getApplicationData(session);
    const noChangeReviewStatement = req.body["no_change_review_statement"];

    if (noChangeReviewStatement === "0") {
      return res.redirect(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
    }

    let transactionID: string, overseasEntityID: string;
    if (isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME)) {
      transactionID = appData[Transactionkey] as string;
      overseasEntityID = appData[OverseasEntityKey] as string;
    } else {
      transactionID = await postTransaction(req, session);
      overseasEntityID = await createOverseasEntity(req, session, transactionID);
    }

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
    backLinkUrl = (isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_TRUSTS) && hasAnyBosWithTrusteeNocs) ? UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL : UPDATE_BENEFICIAL_OWNER_TYPE_URL;
    if (isRemove) {
      backLinkUrl = isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION) ? REMOVE_CONFIRM_STATEMENT_URL : backLinkUrl;
    } else {
      backLinkUrl = isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION) ? UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL : backLinkUrl;
    }
    return backLinkUrl;
  }
};

const getTemplateName = (isNoChangeJourney: boolean) => (
  isNoChangeJourney
    ? UPDATE_REVIEW_STATEMENT_PAGE
    : UPDATE_CHECK_YOUR_ANSWERS_PAGE
);

