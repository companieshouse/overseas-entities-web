import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationData } from "../model";
import { PresenterKey, PresenterKeys } from "../model/presenter.model";
import { IsRemoveKey, OverseasEntityKey, Transactionkey } from '../model/data.types.model';
import { getApplicationData, prepareData, setApplicationData, setExtraData } from "./application.data";
import { logger } from "./logger";
import { saveAndContinue } from "./save.and.continue";
import { isRemoveJourney } from "../utils/url";
import * as config from "../config";
import { postTransaction } from "../service/transaction.service";
import { createOverseasEntity } from "../service/overseas.entities.service";

export const getPresenterPage = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const presenter = appData[PresenterKey];

    if (isRemoveJourney(req)){
      return res.render(templateName, {
        journey: config.JourneyType.remove,
        backLinkUrl: `${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
        templateName: templateName,
        ...presenter
      });
    }

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      ...presenter
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postPresenterPage = async (req: Request, res: Response, next: NextFunction, redirectUrl: string): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;

    if (isRemoveJourney(req)) {
      const appData: ApplicationData = getApplicationData(session);
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[IsRemoveKey] = true;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
        setExtraData(req.session, appData);
      }
    }

    const data = prepareData(req.body, PresenterKeys);
    setApplicationData(session, data, PresenterKey);

    await saveAndContinue(req, session);

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
