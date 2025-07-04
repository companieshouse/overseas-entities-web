import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../../model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData } from "../../utils/application.data";
import { Update } from "../../model/update.type.model";
import { Session } from "@companieshouse/node-session-handler";
import { isRemoveJourney } from "../../utils/url";
import { CompanyPersonsWithSignificantControlStatements } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements/types";
import { isActiveFeature } from "../../utils/feature.flag";
import { getCompanyPscStatements } from "../../service/persons.with.signficant.control.statement.service";
import { relevantPeriodPscStatements } from "../../utils/relevant.period";

export const relevantPeriodStatementsState = {
  has_answered_relevant_period_question: false,
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req.session as Session);
    const update = appData.update as Update;
    const isRemove: boolean = await isRemoveJourney(req);

    if (isRemove) {
      return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
        journey: config.JourneyType.remove,
        backLinkUrl: `${config.OVERSEAS_ENTITY_QUERY_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
        updateUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
        templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
        ...appData,
        registrationDate: update.date_of_creation
      });
    }

    return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_QUERY_URL,
      updateUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
      ...appData,
      registrationDate: update.date_of_creation
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
    const appData: ApplicationData = await getApplicationData(req.session as Session);

    if (isRemove) {
      return res.redirect(`${config.OVERSEAS_ENTITY_PRESENTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    }

    if (appData.entity && appData.entity_number) {
      const statements: CompanyPersonsWithSignificantControlStatements = await getCompanyPscStatements(req, appData.entity_number);
      relevantPeriodStatementsState.has_answered_relevant_period_question = statements?.items?.length > 0 && statements.items.some(item => relevantPeriodPscStatements.has(item.statement));

      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD) && !relevantPeriodStatementsState.has_answered_relevant_period_question) {
        return res.redirect(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
      }
    }
    return res.redirect(config.UPDATE_FILING_DATE_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
