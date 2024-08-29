import { NextFunction, Request, Response } from "express";

import { logger } from "./logger";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "./application.data";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../model/who.is.making.filing.model";
import { Session } from "@companieshouse/node-session-handler";
import { isActiveFeature } from "./feature.flag";
import * as config from "../config";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { updateOverseasEntity } from "../service/overseas.entities.service";

export const getWhoIsFiling = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(templateName, {
      backLinkUrl,
      templateName,
      [WhoIsRegisteringKey]: appData[WhoIsRegisteringKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postWhoIsFiling = async (
  req: Request,
  res: Response,
  next: NextFunction,
  agentUrl: string,
  oeUrl: string,
  isRegistrationJourney: boolean = false
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const whoIsRegistering = req.body[WhoIsRegisteringKey];
    appData[WhoIsRegisteringKey] = whoIsRegistering;
    const session = req.session as Session;

    let nextPageUrl: string = "";

    if (whoIsRegistering === WhoIsRegisteringType.AGENT) {
      nextPageUrl = agentUrl;
    }
    if (whoIsRegistering === WhoIsRegisteringType.SOMEONE_ELSE) {
      nextPageUrl = oeUrl;
    }
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistrationJourney) {
      if (appData[Transactionkey] && appData[OverseasEntityKey]) {
        await updateOverseasEntity(req, session, appData);
      } else {
        throw new Error("Error: who_is_registering filter page cannot be updated - transaction_id or overseas_entity_id is missing");
      }
    }
    setExtraData(session, appData);
    return res.redirect(nextPageUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
