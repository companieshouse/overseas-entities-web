import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";

import { createOverseasEntity, updateOverseasEntity } from "../service/overseas.entities.service";
import { closeTransaction, postTransaction } from "../service/transaction.service";

import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";
import { logger } from "../utils/logger";
import { checkEntityRequiresTrusts, getTrustLandingUrl } from "../utils/trusts";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { startPaymentsSession } from "../service/payment.service";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { RoleWithinTrustType } from "../model/role.within.trust.type.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const requiresTrusts: boolean = checkEntityRequiresTrusts(appData);
    const changeLinkUrl: string = config.ENTITY_URL;
    const overseasEntityHeading: string = config.OVERSEAS_ENTITY_SECTION_HEADING;
    const whoIsCompletingChangeLink: string = config.WHO_IS_MAKING_FILING_URL;

    logger.infoRequest(req, `${config.CHECK_YOUR_ANSWERS_PAGE} hasTrusts=${requiresTrusts}`);

    let backLinkUrl: string = config.BENEFICIAL_OWNER_TYPE_URL;
    if (requiresTrusts) {
      backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_TRUSTS_WEB)
        ? getTrustLandingUrl(appData, req)
        : config.TRUST_INFO_PAGE;
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
    logger.debugRequest(req, `POST ${config.CHECK_YOUR_ANSWERS_WITH_PARAMS_URL}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    let transactionID, overseasEntityID;
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      transactionID = appData[Transactionkey] as string;
      overseasEntityID = appData[OverseasEntityKey] as string;
      await updateOverseasEntity(req, session);
    } else {
      transactionID = await postTransaction(req, session);
      overseasEntityID = await createOverseasEntity(req, session, transactionID);
    }

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
