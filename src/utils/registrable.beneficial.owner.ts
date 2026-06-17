import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { logger } from "../utils/logger";
import { yesNoResponse } from "../model/data.types.model";
import { getRedirectUrl } from "../utils/url";
import { ApplicationData } from "../model/application.model";
import { isActiveFeature } from "./feature.flag";
import { saveAndContinue } from "./save.and.continue";
import { updateOverseasEntity } from "../service/overseas.entities.service";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";
import { getApplicationData, setExtraData } from "../utils/application.data";

export const getRegistrableBeneficialOwner = async (req: Request, res: Response, next: NextFunction, noChangeFlag?: boolean): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req);
    let templateName: string;
    let backLinkUrl: string;

    if (noChangeFlag) {
      backLinkUrl = config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE;
      templateName = config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_PAGE;
    } else {
      templateName = config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE;
      backLinkUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
      });
    }
    return res.render(templateName, {
      ...appData,
      backLinkUrl,
      templateName,
      noChangeFlag,
      [RegistrableBeneficialOwnerKey]: appData.update?.[RegistrableBeneficialOwnerKey],
    });
  } catch (error) {
    next(error);
  }
};

export const postRegistrableBeneficialOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRegistrableBeneficialOwner = req.body[RegistrableBeneficialOwnerKey];
    const session = req.session as Session;
    const appData: ApplicationData = await getApplicationData(req);

    if (appData.update) {
      appData.update.registrable_beneficial_owner = isRegistrableBeneficialOwner === '1' ? yesNoResponse.Yes : yesNoResponse.No;
    }

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      await updateOverseasEntity(req, session, appData);
    } else {
      await saveAndContinue(req, session);
    }

    setExtraData(req.session, appData);

    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_STATEMENT_VALIDATION_ERRORS_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_STATEMENT_VALIDATION_ERRORS_URL,
    }));

  } catch (error) {
    next(error);
  }
};

