import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { fetchApplicationData } from "../../utils/application.data";
import { Update } from "../../model/update.type.model";
import { CompanyPersonsWithSignificantControlStatements } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements/types";
import { isActiveFeature } from "../../utils/feature.flag";
import { getCompanyPscStatements } from "../../service/persons.with.signficant.control.statement.service";
import { relevantPeriodPscStatements } from "../../utils/relevant.period";
import { EntityNumberCookieKey } from "../../model/data.types.model";
import { getCompanyProfile } from "../../service/company.profile.service";
import { mapCompanyProfileToOverseasEntity } from "../../utils/update/company.profile.mapper.to.overseas.entity";
import { mapInputDate } from "../../utils/update/mapper.utils";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";

export const relevantPeriodStatementsState = {
  has_answered_relevant_period_question: false,
};

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    let appData: ApplicationData = {};
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      appData = await getCompanyProfileData(req);
    } else {
      appData = await fetchApplicationData(req, !isRemove);
    }
    const update = appData.update as Update;

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

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.OVERSEAS_ENTITY_QUERY_URL,
    });

    return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
      backLinkUrl,
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
    let appData: ApplicationData = {};
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      appData = await getCompanyProfileData(req);
    } else {
      appData = await fetchApplicationData(req, !isRemove);
    }

    if (isRemove) {
      return res.redirect(`${config.OVERSEAS_ENTITY_PRESENTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
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

const getCompanyProfileData = async (req: Request): Promise<ApplicationData> => {
  const entityNumber = req.cookies[EntityNumberCookieKey];
  let data: ApplicationData = {
    "entity_number": entityNumber,
  };
  const companyProfile = await getCompanyProfile(req, entityNumber);
  if (!companyProfile) {
    throw new Error('Company profile not found');
  } else {
    data = {
      ...data,
      "entity_name": companyProfile.companyName,
      "entity": mapCompanyProfileToOverseasEntity(companyProfile),
      "update": {
        date_of_creation: mapInputDate(companyProfile.dateOfCreation),
      }
    };
  }
  return data;
};
