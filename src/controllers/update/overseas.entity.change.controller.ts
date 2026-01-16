import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { NoChangeKey } from "../../model/update.type.model";
import { retrieveBoAndMoData } from "../../utils/update/beneficial_owners_managing_officers_data_fetch";
import { getCompanyProfile } from "../../service/company.profile.service";
import { reloadOE } from "./overseas.entity.query.controller";
import { retrieveTrustData } from "../../utils/update/trust.model.fetch";
import { isNoChangeJourney } from "../../utils/update/no.change.journey";
import { isActiveFeature } from "../../utils/feature.flag";
import { updateOverseasEntity } from "../../service/overseas.entities.service";

import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { fetchApplicationData, setExtraData } from "../../utils/application.data";

export const get = async (req: Request, resp: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.OVERSEAS_ENTITY_PRESENTER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.OVERSEAS_ENTITY_PRESENTER_URL,
    });

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
      backLinkUrl,
      templateName: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE,
      [NoChangeKey]: appData.update?.no_change,
      ...appData,
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, resp: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    let redirectUrl: string;
    const isRemove: boolean = await isRemoveJourney(req);
    const session = req.session as Session;
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const noChangeStatement = req.body[NoChangeKey];

    if (appData.update) {
      appData.update.no_change = noChangeStatement === "1";
    }

    if (isNoChangeJourney(appData)) {
      await resetDataForNoChange(req, appData);
      redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL,
      });
    } else {
      resetDataForChange(appData);
      redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.WHO_IS_MAKING_UPDATE_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.WHO_IS_MAKING_UPDATE_URL,
      });
    }

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      await updateOverseasEntity(req, req.session as Session, appData);
    } else {
      setExtraData(session, appData);
      await saveAndContinue(req, session);
    }

    return resp.redirect(redirectUrl);

  } catch (errors) {
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
  if (appData.update) {
    appData.update.registrable_beneficial_owner = undefined;
  }
  appData.beneficial_owners_statement = undefined;
  appData.payment = undefined;
  return appData;
};
