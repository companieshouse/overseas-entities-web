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
} from "../config";
import { RoleWithinTrustType } from "../model/role.within.trust.type.model";

export const getDataForReview = (req: Request, res: Response, next: NextFunction, isNoChangeJourney: boolean) => {
  const appData = getApplicationData(req.session);
  const hasAnyBosWithTrusteeNocs = isNoChangeJourney ? checkEntityReviewRequiresTrusts(appData) : checkEntityRequiresTrusts(appData);

  const backLinkUrl = getBackLinkUrl(isNoChangeJourney, hasAnyBosWithTrusteeNocs);
  const templateName = getTemplateName(isNoChangeJourney);

  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

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
        isTrustFeatureEnabled: isActiveFeature(FEATURE_FLAG_ENABLE_TRUSTS_WEB),
        hasAnyBosWithTrusteeNocs,
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

const getBackLinkUrl = (isNoChangeJourney: boolean, hasAnyBosWithTrusteeNocs: boolean) => {
  if (isNoChangeJourney) {
    return UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL;
  } else {
    const updateTrustsEnabled = isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_TRUSTS);

    return updateTrustsEnabled && hasAnyBosWithTrusteeNocs
      ? UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL
      : UPDATE_BENEFICIAL_OWNER_TYPE_URL;
  }
};

const getTemplateName = (isNoChangeJourney: boolean) => (
  isNoChangeJourney
    ? UPDATE_REVIEW_STATEMENT_PAGE
    : UPDATE_CHECK_YOUR_ANSWERS_PAGE
);
