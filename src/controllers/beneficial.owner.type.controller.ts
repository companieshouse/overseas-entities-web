import { NextFunction, Request, Response } from "express";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType, beneficialOwnerTypeType } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_TYPE_PAGE, {
      backLinkUrl: config.ENTITY_URL,
      ...appData.beneficialOwnerType
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_TYPE_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, beneficialOwnerTypeType.BeneficialOwnerTypeKeys);
    setApplicationData(req.session, data, beneficialOwnerTypeType.BeneficialOwnerTypeKey);

    return res.redirect("/next-page");
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
