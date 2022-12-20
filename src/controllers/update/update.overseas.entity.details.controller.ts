import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";


export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    return res.render(config.UPDATE_OVERSEAS_ENTITY_REVIEW_PAGE, {
      templateName: config.UPDATE_OVERSEAS_ENTITY_REVIEW_PAGE,
      appData
    });
  }  catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
