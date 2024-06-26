import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model/application.model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";
import { isActiveFeature } from "./feature.flag";
import { yesNoResponse } from "../model/data.types.model";
import { Session } from "@companieshouse/node-session-handler";
import { saveAndContinue } from "./save.and.continue";
import { isRemoveJourney } from "../utils/url";

export const getRegistrableBeneficialOwner = async (req: Request, res: Response, next: NextFunction, noChangeFlag?: boolean) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req.session);
    let templateName: string;
    let backLinkUrl: string;
    if (noChangeFlag) {
      backLinkUrl = config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE;
      templateName = config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE;
    } else {
      backLinkUrl = config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL;
      templateName = config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE;
    }
    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      ...appData,
      [RegistrableBeneficialOwnerKey]: appData.update?.[RegistrableBeneficialOwnerKey],
      noChangeFlag,
      statementValidationFlag: isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION)
    });
  } catch (error) {
    next(error);
  }
};

export const postRegistrableBeneficialOwner = async (req: Request, res: Response, next: NextFunction, noChangeFlag?: boolean) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRegistrableBeneficialOwner = req.body[RegistrableBeneficialOwnerKey];
    const session = req.session as Session;
    const appData: ApplicationData = await getApplicationData(session);
    if (appData.update) {
      appData.update.registrable_beneficial_owner = isRegistrableBeneficialOwner === '1' ? yesNoResponse.Yes : yesNoResponse.No;
    }
    setExtraData(req.session, appData);
    await saveAndContinue(req, session, false);

    if (await isRemoveJourney(req)) {
      const redirectUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION)
        ? config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL
        : config.REMOVE_CONFIRM_STATEMENT_URL;

      return res.redirect(redirectUrl);
    }

    if (noChangeFlag) {
      noChangeHandler(req, res);
    } else {
      const redirectUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION)
        ? config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL
        : config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL;
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
};

const noChangeHandler = (req: Request, res: Response) => {
  const redirectUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_STATEMENT_VALIDATION)
    ? config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL
    : config.UPDATE_REVIEW_STATEMENT_URL;

  return res.redirect(redirectUrl);

};

