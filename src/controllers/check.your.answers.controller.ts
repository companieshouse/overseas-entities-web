import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../utils/logger";
import * as config from "../config";
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { closeTransaction } from "../service/transaction.service";
import { isActiveFeature } from "../utils/feature.flag";
import { ApplicationData } from "../model";
import { startPaymentsSession } from "../service/payment.service";
import { RoleWithinTrustType } from "../model/role.within.trust.type.model";
import { fetchApplicationData } from "../utils/application.data";

import { getUrlWithParamsToPath, isRegistrationJourney } from "../utils/url";
import { checkEntityRequiresTrusts, getTrustLandingUrl } from "../utils/trusts";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
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
      ...appData,
      changeLinkUrl,
      overseasEntityHeading,
      whoIsCompletingChangeLink,
      pageParams: {
        isTrustFeatureEnabled: isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB),
        isRegistration: true
      },
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
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
    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
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
