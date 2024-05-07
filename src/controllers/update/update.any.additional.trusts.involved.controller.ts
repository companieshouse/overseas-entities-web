import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { Update } from "../../model/update.type.model";
import { getRegistrationDate } from "../../utils/update/relevant.period";
import { InputDate } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.ADDITIONAL_TRUSTS_INVOLVED_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    const update = appData.update as Update;
    return res.render(config.ADDITIONAL_TRUSTS_INVOLVED_PAGE, {
      backLinkUrl: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE,
      templateName: config.ADDITIONAL_TRUSTS_INVOLVED_PAGE,
      ...appData,
      dateOfCreation: getRegistrationDate(appData.update?.date_of_creation as InputDate)
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.ADDITIONAL_TRUSTS_INVOLVED_PAGE}`);
    return res.redirect(config.ADDITIONAL_TRUSTS_INVOLVED_PAGE); // redirects to itself currently because we don't have the next page
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};