import { NextFunction, Request, Response } from "express";
import { getApplicationData, prepareData, setApplicationData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType, beneficialOwnerIndividualType } from "../model";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  logger.info(`GET ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

  const appData: ApplicationData = getApplicationData(req.session);

  return res.render(config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: config.LANDING_URL,
    ...appData.beneficialOwnerIndividual
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, beneficialOwnerIndividualType.BeneficialOwnerIndividualKeys);
    setApplicationData(req.session, data, beneficialOwnerIndividualType.BeneficialOwnerIndividualKey);

    return res.redirect("/next-page");
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
