import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { logger } from "./logger";
import { ApplicationData } from "../model";
import { isActiveFeature } from "./feature.flag";
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { getApplicationData, setExtraData } from "./application.data";
import { OverseasEntityKey, Transactionkey } from "../model/data.types.model";
import { isRemoveJourney, isUpdateJourney } from "./url";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../model/who.is.making.filing.model";
import { FEATURE_FLAG_ENABLE_REDIS_REMOVAL, JourneyType } from "../config";

export const getWhoIsFiling = async (
  req: Request,
  res: Response,
  next: NextFunction,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req);
    const isRemove: boolean = await isRemoveJourney(req);
    const isUpdate: boolean = await isUpdateJourney(req);

    return res.render(templateName, {
      backLinkUrl,
      templateName,
      [WhoIsRegisteringKey]: appData[WhoIsRegisteringKey],
      journey: isRemove ? JourneyType.remove : (isUpdate ? JourneyType.update : JourneyType.register),
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
    const whoIsRegistering = req.body[WhoIsRegisteringKey];
    const appData: ApplicationData = await getApplicationData(req);
    appData[WhoIsRegisteringKey] = whoIsRegistering;

    let nextPageUrl: string = "";

    if (whoIsRegistering === WhoIsRegisteringType.AGENT) {
      nextPageUrl = agentUrl;
    }

    if (whoIsRegistering === WhoIsRegisteringType.SOMEONE_ELSE) {
      nextPageUrl = oeUrl;
    }

    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
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
