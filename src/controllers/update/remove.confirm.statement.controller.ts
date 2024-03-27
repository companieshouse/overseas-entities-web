import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model/application.model";
import { getApplicationData, getRemove, setApplicationData } from "../../utils/application.data";
import { IsNotProprietorOfLandKey } from "../../model/data.types.model";
import { RemoveKey } from "../../model/remove.type.model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from '@companieshouse/node-session-handler';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_CONFIRM_STATEMENT_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(config.REMOVE_CONFIRM_STATEMENT_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: `${config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL}`,
      ...appData
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.REMOVE_CONFIRM_STATEMENT_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const remove = getRemove(appData);
    remove[IsNotProprietorOfLandKey] = true ;
    setApplicationData(req.session, remove, RemoveKey);

    await saveAndContinue(req, req.session as Session, false);

    const inNoChangeJourney = !!appData.update?.no_change;
    const nextPage = inNoChangeJourney ? `${config.UPDATE_REVIEW_STATEMENT_URL}` : `${config.UPDATE_CHECK_YOUR_ANSWERS_URL}`;

    return res.redirect(nextPage);

  } catch (error) {
    next(error);
  }
};
