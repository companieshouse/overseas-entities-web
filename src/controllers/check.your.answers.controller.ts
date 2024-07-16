import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";

import { updateOverseasEntity } from "../service/overseas.entities.service";
import { closeTransaction } from "../service/transaction.service";

import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";
import { logger } from "../utils/logger";
import { checkEntityRequiresTrusts, getTrustLandingUrl } from "../utils/trusts";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { startPaymentsSession } from "../service/payment.service";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { RoleWithinTrustType } from "../model/role.within.trust.type.model";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const requiresTrusts: boolean = checkEntityRequiresTrusts(appData);
    const changeLinkUrl: string = config.ENTITY_URL;
    const overseasEntityHeading: string = config.OVERSEAS_ENTITY_SECTION_HEADING;
    const whoIsCompletingChangeLink: string = config.WHO_IS_MAKING_FILING_URL;

    logger.infoRequest(req, `${config.CHECK_YOUR_ANSWERS_PAGE} hasTrusts=${requiresTrusts}`);

    let backLinkUrl: string = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
      ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
      : config.BENEFICIAL_OWNER_TYPE_URL;

    if (requiresTrusts) {
      const trustInfoBackLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
        ? getUrlWithParamsToPath(config.TRUST_INFO_WITH_PARAMS_URL, req)
        : config.TRUST_INFO_PAGE;

      backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB)
        ? getTrustLandingUrl(appData, req)
        : trustInfoBackLinkUrl;
    }

    return res.render(config.CHECK_YOUR_ANSWERS_PAGE, {
      backLinkUrl,
      templateName: config.CHECK_YOUR_ANSWERS_PAGE,
      roleTypes: RoleWithinTrustType,
      requiresTrusts,
      appData,
      changeLinkUrl,
      overseasEntityHeading,
      whoIsCompletingChangeLink,
      pageParams: {
        isTrustFeatureEnabled: isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB),
        isRegistration: true
      },
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    const transactionID = appData[Transactionkey] as string;
    const overseasEntityID = appData[OverseasEntityKey] as string;
    await updateOverseasEntity(req, session);

    const transactionClosedResponse = await closeTransaction(req, session, transactionID, overseasEntityID);
    logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);

    const redirectPath = await startPaymentsSession(req, session, transactionID, overseasEntityID, transactionClosedResponse);
    logger.infoRequest(req, `Payments Session created with, Trans_ID: ${transactionID}, OE_ID: ${overseasEntityID}. Redirect to: ${redirectPath}`);

    return res.redirect(redirectPath);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
