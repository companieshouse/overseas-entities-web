import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model/application.model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { RegistrableBeneficialOwnerKey } from "../../model/update.type.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_REVIEW_URL,
      templateName: config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE,
      appData,
      [RegistrableBeneficialOwnerKey]: appData.update?.[RegistrableBeneficialOwnerKey]
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRegistrableBeneficialOwner = req.body[RegistrableBeneficialOwnerKey];
    const appData: ApplicationData = getApplicationData(req.session);
    if (appData.update) {
      appData.update.registrable_beneficial_owner = isRegistrableBeneficialOwner;
    }
    setExtraData(req.session, appData);
    return res.redirect(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
  } catch (error) {
    next(error);
  }
};
