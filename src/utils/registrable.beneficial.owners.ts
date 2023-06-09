import { NextFunction, Request, Response } from "express";
import { logger } from "./logger";
import { ApplicationData } from "../model/application.model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { RegistrableBeneficialOwnerKey } from "../model/update.type.model";
import { saveAndContinue } from "./save.and.continue";
import { Session } from "@companieshouse/node-session-handler";

export const getRegistrableBeneficialOwner = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: templateName,
      ...appData,
      [RegistrableBeneficialOwnerKey]: appData.update?.[RegistrableBeneficialOwnerKey]
    });
  } catch (error) {
    next(error);
  }
};

export const postRegistrableBeneficialOwner = async (req: Request, res: Response, next: NextFunction, redirectUrl: string, registrationFlag: boolean, incrementalSave: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistrableBeneficialOwner = req.body[RegistrableBeneficialOwnerKey];
    const session = req.session as Session;

    const appData: ApplicationData = getApplicationData(session);
    if (appData.update) {
      appData.update.registrable_beneficial_owner = (isRegistrableBeneficialOwner) ? +isRegistrableBeneficialOwner : 0;
    }

    setExtraData(session, appData);

    if(incrementalSave){
      await saveAndContinue(req, session, registrationFlag);
    }

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
