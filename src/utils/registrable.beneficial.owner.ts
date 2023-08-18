import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model/application.model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";
import { isActiveFeature } from "./feature.flag";

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
      noChangeFlag,
      statementValidationFlag: isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION)
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
      const redirectUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION)
        ? config.UPDATE_CHECK_YOUR_ANSWERS_URL
        : config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL;
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
};

const noChangeHandler = (req: Request, res: Response, next: NextFunction, registrableOwnerChoice) => {
  if (registrableOwnerChoice === "0"){
    return res.redirect(config.UPDATE_REVIEW_STATEMENT_URL);
  } else {
    return res.redirect(config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
  }
};
