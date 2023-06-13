import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model/application.model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";

export const getRegistrableBeneficialOwner = (req: Request, res: Response, next: NextFunction, noChangeFlag?: boolean) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);
    let templateName: string;
    let backLinkUrl: string;

    if (noChangeFlag){
      backLinkUrl = config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE;
      templateName = config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE;
    } else {
      backLinkUrl = config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL;
      templateName = config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE;
    }
    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      appData,
      [RegistrableBeneficialOwnerKey]: appData.update?.[RegistrableBeneficialOwnerKey],
      noChangeFlag
    });
  } catch (error) {
    next(error);
  }
};

export const postRegistrableBeneficialOwner = (req: Request, res: Response, next: NextFunction, noChangeFlag?: boolean) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRegistrableBeneficialOwner = req.body[RegistrableBeneficialOwnerKey];
    const appData: ApplicationData = getApplicationData(req.session);
    if (appData.update) {
      appData.update.registrable_beneficial_owner = (isRegistrableBeneficialOwner) ? +isRegistrableBeneficialOwner : 0;
    }
    setExtraData(req.session, appData);

    if (noChangeFlag){
      noChangeHandler(req, res, next, isRegistrableBeneficialOwner);
    } else {
      return res.redirect(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
    }
  } catch (error) {
    next(error);
  }
};

const noChangeHandler = (req: Request, res: Response, next: NextFunction, registrableOwnerChoice) => {
  if (registrableOwnerChoice === "1"){
    return res.redirect(""); // UAR-584
  } else {
    return res.redirect(config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
  }
};
