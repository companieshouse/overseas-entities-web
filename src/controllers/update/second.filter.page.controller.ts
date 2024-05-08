import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { SecondFilterKey } from "../../model/second.filter.page.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SECOND_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.SECOND_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_PRESENTER_PAGE,
      templateName: config.SECOND_FILTER_PAGE,
      ...appData,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SECOND_FILTER_PAGE}`);
    const secondFilterKey = req.body[SecondFilterKey];
    // TODO: store secondFilterKey in ApplicationData and turn on questions about the relevant period.

    if (ownedLandKey === '1') {
      return res.redirect(config.SECOND_FILTER_PAGE_URL); // currently redirects to itself because next page is not built
    } else if (ownedLandKey === '0') {
      return res.redirect(config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};