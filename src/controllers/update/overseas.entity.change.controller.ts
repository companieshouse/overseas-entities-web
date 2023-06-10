import { NextFunction, Request, Response } from "express";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from "@companieshouse/node-session-handler";
import { NoChangeKey } from "../../model/update.type.model";

export const get = (req: Request, resp: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return resp.render(config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_PRESENTER_URL,
      templateName: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
      ...appData,
    });
  } catch (error){
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const session = req.session as Session;
    let redirectUrl: string;
    const appData: ApplicationData = getApplicationData(req.session);
    const isMakingOeChange = req.body[NoChangeKey];

    if (appData.update){
      appData.update.no_change = isMakingOeChange;
      setExtraData(session, appData);
    }

    if (isMakingOeChange === "1"){
      redirectUrl = config.WHO_IS_MAKING_UPDATE_URL;
    } else {
      redirectUrl = config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENT_URL;
    }
    await saveAndContinue(req, session, false);
    return resp.redirect(redirectUrl);

  } catch (errors){
    logger.errorRequest(req, errors);
    next(errors);
  }
};
