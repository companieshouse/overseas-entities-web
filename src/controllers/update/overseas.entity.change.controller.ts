import { NextFunction, Request, Response } from "express";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { Session } from "@companieshouse/node-session-handler";
import { NoChangeKey } from "../../model/update.type.model";
import { retrieveBoAndMoData } from "../../utils/update/beneficial_owners_managing_officers_data_fetch";
import { getCompanyProfile } from "../../service/company.profile.service";
import { reloadOE } from "./overseas.entity.query.controller";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { retrieveTrustData } from "../../utils/update/trust.model.fetch";
import { isRemoveJourney } from "../../utils/url";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { isActiveFeature } from "../../utils/feature.flag";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req.session);
    const isRemove: boolean = await isRemoveJourney(req);

    if (isRemove) {
      return resp.render(config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE, {
        journey: config.JourneyType.remove,
        backLinkUrl: config.OVERSEAS_ENTITY_PRESENTER_URL,
        templateName: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE,
        [NoChangeKey]: appData.update?.no_change,
        ...appData,
      });
    }
    return resp.render(config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_PRESENTER_URL,
      templateName: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE,
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
    const appData: ApplicationData = await getApplicationData(req.session);
    const noChangeStatement = req.body[NoChangeKey];

    if (appData.update) {
      appData.update.no_change = noChangeStatement === "1";
    }

    const relevantNoPeriodChange = isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD) ? !checkRelevantPeriod(appData) : true;

    if (noChangeStatement === "1" && relevantNoPeriodChange) {
      await resetDataForNoChange(req, appData);
      redirectUrl = config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL;
    } else {
      resetDataForChange(appData);
      redirectUrl = config.WHO_IS_MAKING_UPDATE_URL;
    }

    setExtraData(session, appData);
    await saveAndContinue(req, session);

    return resp.redirect(redirectUrl);

  } catch (errors){
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const resetDataForNoChange = async (req: Request, appData: ApplicationData) => {
  if (appData) {
    appData.who_is_registering = undefined;
    appData.due_diligence = undefined;
    appData.overseas_entity_due_diligence = undefined;
    appData.beneficial_owners_individual = undefined;
    appData.beneficial_owners_corporate = undefined;
    appData.beneficial_owners_government_or_public_authority = undefined;
    appData.managing_officers_corporate = undefined;
    appData.managing_officers_individual = undefined;
    appData.beneficial_owners_statement = undefined;
    appData.payment = undefined;
    appData.trusts = undefined;
    appData.entity = undefined;
    const companyProfile = await getCompanyProfile(req, appData.entity_number as string) as CompanyProfile;
    reloadOE(appData, appData.entity_number as string, companyProfile);
  }
  if (appData.update) {
    appData.update.registrable_beneficial_owner = undefined;
    appData.update.bo_mo_data_fetched = false;
    await retrieveBoAndMoData(req, appData);

    appData.update.trust_data_fetched = false;
    appData.update.review_trusts = undefined;
    await retrieveTrustData(req, appData);
  }

  return appData;
};

export const resetDataForChange = (appData: ApplicationData) => {
  if (appData.update){
    appData.update.registrable_beneficial_owner = undefined;
  }
  appData.beneficial_owners_statement = undefined;
  appData.payment = undefined;
  return appData;
};
