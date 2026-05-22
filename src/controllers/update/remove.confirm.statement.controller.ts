import { NextFunction, Request, Response } from "express";
import { Session } from '@companieshouse/node-session-handler';
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { RemoveKey } from "../../model/remove.type.model";
import { getRedirectUrl } from "../../utils/url";
import { isActiveFeature } from "../../utils/feature.flag";
import { saveAndContinue } from "../../utils/save.and.continue";
import { ApplicationData } from "../../model/application.model";
import { IsNotProprietorOfLandKey } from "../../model/data.types.model";
import { getRemove, getApplicationData, setApplicationData, } from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_CONFIRM_STATEMENT_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req);
    return res.render(config.REMOVE_CONFIRM_STATEMENT_PAGE, {
      ...appData,
      journey: config.JourneyType.remove,
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `POST ${config.REMOVE_CONFIRM_STATEMENT_PAGE}`);

    const appData: ApplicationData = await getApplicationData(req);
    const remove = getRemove(appData);
    remove[IsNotProprietorOfLandKey] = true ;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      await setApplicationData(req, remove, RemoveKey);
    } else {
      await setApplicationData(req.session, remove, RemoveKey);
      await saveAndContinue(req, req.session as Session);
    }

    const inNoChangeJourney = !!appData.update?.no_change;
    const nextPage = getNextPageUrl(req, inNoChangeJourney);

    return res.redirect(nextPage);

  } catch (error) {
    next(error);
  }
};

const getNextPageUrl = (req: Request, inNoChangeJourney: boolean) => {
  if (inNoChangeJourney) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_REVIEW_STATEMENT_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_REVIEW_STATEMENT_URL,
    });
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_CHECK_YOUR_ANSWERS_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_CHECK_YOUR_ANSWERS_URL,
    });
  }
};
