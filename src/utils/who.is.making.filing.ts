import { NextFunction, Request, Response } from "express";

import { logger } from "./logger";
import { ApplicationData } from "../model";
import { fetchApplicationData, setExtraData } from "./application.data";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../model/who.is.making.filing.model";
import { Session } from "@companieshouse/node-session-handler";
import { isActiveFeature } from "./feature.flag";
import * as config from "../config";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { isRegistrationJourney } from "./url";

export const getWhoIsFiling = async (
  req: Request,
  res: Response,
  next: NextFunction,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

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
  oeUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const isRegistration: boolean = isRegistrationJourney(req);
    const whoIsRegistering = req.body[WhoIsRegisteringKey];
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    appData[WhoIsRegisteringKey] = whoIsRegistering;

    let nextPageUrl: string = "";

    if (whoIsRegistering === WhoIsRegisteringType.AGENT) {
      nextPageUrl = agentUrl;
    }
    if (whoIsRegistering === WhoIsRegisteringType.SOMEONE_ELSE) {
      nextPageUrl = oeUrl;
    }

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
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
