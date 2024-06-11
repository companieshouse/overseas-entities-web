import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { OwnedLandKey } from "../../model/update.type.model";
import { getRegistrationDate } from "../../utils/update/relevant.period";
import { InputDate } from "../../model/data.types.model";

const getMethod: string = "GET";
const postMethod: string = "POST";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    beforeRender(req, res, getMethod);
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
    beforeRender(req, res, postMethod);
    const ownedLandKey = req.body[OwnedLandKey] ?? '';

    if (ownedLandKey === '1') {
      return res.redirect(config.RELEVANT_PERIOD_INTERRUPT_URL);
    } else if (ownedLandKey !== '0' && ownedLandKey === '') {
      return renderGetPageWithError(req, res, next);
    } else {
      return res.redirect(config.UPDATE_FILING_DATE_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

function beforeRender(req: Request, res: Response, method: String) {
  logger.debugRequest(req, `${method} ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE}`);
}

function createOwnedLandError(): any {
  const msg = `Select yes if the overseas entity was the registered owner of UK land during the pre-registration period.`;
  const errors = { errorList: [] } as any;
  errors.errorList.push({ href: "#owned_land_relevant_period", text: msg });
  errors.test = { text: msg };
  return errors;
}

const renderGetPageWithError = (req: Request, res: Response, next: NextFunction) => {
  try {
    beforeRender(req, res, getMethod);
    const errors = createOwnedLandError();
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE,
      ...appData,
      dateOfCreation: getRegistrationDate(appData.update?.date_of_creation as InputDate),
      errors
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
