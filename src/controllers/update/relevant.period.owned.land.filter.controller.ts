import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { OwnedLandKey } from "../../model/update.type.model";
import { getRegistrationDate } from "../../utils/update/relevant.period";
import { InputDate } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE,
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
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE}`);
    const ownedLandKey = req.body[OwnedLandKey];

    if (ownedLandKey === '1') {
      return res.redirect(config.RELEVANT_PERIOD_INTERRUPT_URL);
    } else {
      return res.redirect(config.UPDATE_FILING_DATE_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};