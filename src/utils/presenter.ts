import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { logger } from "./logger";
import { isActiveFeature } from "./feature.flag";
import { ApplicationData } from "../model";
import { saveAndContinue } from "./save.and.continue";
import { postTransaction } from "../service/transaction.service";
import { createOverseasEntity } from "../service/overseas.entities.service";
import { getRedirectUrl, isRemoveJourney } from "../utils/url";
import { PresenterKey, PresenterKeys } from "../model/presenter.model";

import {
  IsRemoveKey,
  Transactionkey,
  OverseasEntityKey,
} from '../model/data.types.model';

import {
  prepareData,
  setExtraData,
  setApplicationData,
  getApplicationData,
} from "./application.data";

export const getPresenterPage = async (
  req: Request,
  res: Response,
  next: NextFunction,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await getApplicationData(req);
    const presenter = appData[PresenterKey];

    if (isRemove) {

      const backLinkUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      }) + config.JOURNEY_REMOVE_QUERY_PARAM;

      return res.render(templateName, {
        ...presenter,
        backLinkUrl,
        templateName,
        journey: config.JourneyType.remove,
      });
    }

    return res.render(templateName, {
      ...presenter,
      backLinkUrl,
      templateName,
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postPresenterPage = async (
  req: Request,
  res: Response,
  next: NextFunction,
  redirectUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const isRemove: boolean = await isRemoveJourney(req);

    if (isRemove) {
      const appData: ApplicationData = await getApplicationData(req);
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[IsRemoveKey] = true;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
        setExtraData(req.session, appData);
      }
    }

    const data = prepareData(req.body, PresenterKeys);

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      await setApplicationData(req, data, PresenterKey);
    } else {
      await setApplicationData(session, data, PresenterKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
