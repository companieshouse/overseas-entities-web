import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { Update } from "../../model/update.type.model";
import { isActiveFeature } from "../../utils/feature.flag";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { getDataFromEntityCookie } from "../../utils/update/data.cookie";
import { getCompanyPscStatements } from "../../service/persons.with.signficant.control.statement.service";
import { relevantPeriodPscStatements } from "../../utils/relevant.period";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { CompanyPersonsWithSignificantControlStatements } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements/types";

export const relevantPeriodStatementsState = {
  has_answered_relevant_period_question: false,
};

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    let appData: ApplicationData = {};
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      appData = await getDataFromEntityCookie(req);
    } else {
      appData = await getApplicationData(req);
    }
    const update = appData.update as Update;

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.OVERSEAS_ENTITY_QUERY_URL,
    });

    const updateUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
    });

    if (isRemove) {

      return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
        ...appData,
        updateUrl,
        journey: config.JourneyType.remove,
        registrationDate: update.date_of_creation,
        backLinkUrl: backLinkUrl + config.JOURNEY_REMOVE_QUERY_PARAM,
        templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
      });
    }

    return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
      ...appData,
      updateUrl,
      backLinkUrl,
      registrationDate: update.date_of_creation,
      templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
    });

  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    let appData: ApplicationData = {};
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      appData = await getDataFromEntityCookie(req);
    } else {
      appData = await getApplicationData(req);
    }

    if (isRemove) {
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: config.OVERSEAS_ENTITY_PRESENTER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.OVERSEAS_ENTITY_PRESENTER_URL,
      }) + config.JOURNEY_REMOVE_QUERY_PARAM);
    }

    if (appData.entity && appData.entity_number) {
      const statements: CompanyPersonsWithSignificantControlStatements = await getCompanyPscStatements(req, appData.entity_number);
      relevantPeriodStatementsState.has_answered_relevant_period_question = statements?.items?.length > 0 && statements.items.some(item => relevantPeriodPscStatements.has(item.statement));
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD) && !relevantPeriodStatementsState.has_answered_relevant_period_question) {
        const nextPageUrl = getRedirectUrl({
          req,
          urlWithEntityIds: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_WITH_PARAMS_URL,
          urlWithoutEntityIds: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL,
        });
        return res.redirect(nextPageUrl + config.RELEVANT_PERIOD_QUERY_PARAM);
      }
    }

    const nextPageUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_FILING_DATE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_FILING_DATE_URL,
    });

    return res.redirect(nextPageUrl);

  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

