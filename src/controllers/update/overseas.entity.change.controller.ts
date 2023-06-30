import { NextFunction, Request, Response } from "express";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from "@companieshouse/node-session-handler";
import { NoChangeKey } from "../../model/update.type.model";
import { retrieveBeneficialOwners, retrieveManagingOfficers } from "../../utils/update/beneficial_owners_managing_officers_data_fetch";

export const get = (req: Request, resp: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);
    return resp.render(config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_PRESENTER_URL,
      templateName: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
      [NoChangeKey]: appData.update?.no_change,
      ...appData,
    });
  } catch (error){
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const session = req.session as Session;
    let redirectUrl: string;
    const appData: ApplicationData = getApplicationData(req.session);
    const noChangeStatement = req.body[NoChangeKey];

    if (appData.update){
      appData.update.no_change = noChangeStatement === "1" ? true : false;
      setExtraData(session, appData);
    }

    if (noChangeStatement === "1"){
      await resetChangeData(req, appData)
      redirectUrl = config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL;
    } else {
      resetNoChangeData(appData);
      redirectUrl = config.WHO_IS_MAKING_UPDATE_URL;
    }
    console.log(`after existing ${JSON.stringify(appData)}`);
    await saveAndContinue(req, session, false);
    return resp.redirect(redirectUrl);

  } catch (errors){
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const resetChangeData = async (req: Request, appData: ApplicationData) => {
  if(appData){
    console.log("inside of if")
    appData.who_is_registering = undefined;
    appData.overseas_entity_due_diligence = undefined;
    appData.beneficial_owners_individual = undefined;
    appData.beneficial_owners_corporate =  undefined;
    appData.beneficial_owners_government_or_public_authority = undefined;
    appData.managing_officers_corporate = undefined;
    appData.managing_officers_individual = undefined;
    appData.beneficial_owners_statement = undefined;
    appData.payment = undefined;
    await existingBoMoForNoChange(req, appData);
  }
  return appData;
}

export const resetNoChangeData = (appData: ApplicationData) => {
  if(appData.update){
    appData.update.no_change = undefined;
    appData.beneficial_owners_statement = undefined;
    appData.update.registrable_beneficial_owner = undefined;
  }
  return appData;
}

const existingBoMoForNoChange = async (req: Request,  appData: ApplicationData) => {
  await retrieveBeneficialOwners(req, appData);
  await retrieveManagingOfficers(req, appData);
}