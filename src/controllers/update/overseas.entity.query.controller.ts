import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { resetEntityUpdate } from "../../utils/update/update.reset";
import { EntityNumberKey } from "../../model/data.types.model";
import { getCompanyProfile } from "../../service/company.profile.service";
import { mapCompanyProfileToOverseasEntity } from "../../utils/update/company.profile.mapper.to.overseas.entity";
import { mapInputDate } from "../../utils/update/mapper.utils";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { retrieveBoAndMoData } from "../../utils/update/beneficial_owners_managing_officers_data_fetch";
import { isRemoveJourney } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);

    if (isRemoveJourney(req)) {
      return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
        journey: config.JourneyType.remove,
        backLinkUrl: `${config.UPDATE_INTERRUPT_CARD_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
        templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
        chsUrl: process.env.CHS_URL,
        [EntityNumberKey]: appData[EntityNumberKey]
      });
    }

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl: config.UPDATE_INTERRUPT_CARD_URL,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
      chsUrl: process.env.CHS_URL,
      [EntityNumberKey]: appData[EntityNumberKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const entityNumber = req.body[EntityNumberKey];
    const companyProfile = await getCompanyProfile(req, entityNumber);

    if (!companyProfile) {
      return renderGetPageWithError(req, res, entityNumber);
    }

    const appData: ApplicationData = getApplicationData(req.session);
    if (appData.entity_number !== entityNumber) {
      await addOeToApplicationData(req, appData, entityNumber, companyProfile);
    }

    if (isRemoveJourney(req)) {
      return res.redirect(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    }

    return res.redirect(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

function createEntityNumberError(entityNumber: string): any {
  const msg = `An Overseas Entity with OE number "${entityNumber}" was not found.`;
  const errors = { errorList: [] } as any;
  errors.errorList.push({ href: "#entity_number", text: msg });
  errors.entity_number = { text: msg };
  return errors;
}

const renderGetPageWithError = (req: Request, res: Response, entityNumber: any) => {
  const errors = createEntityNumberError(entityNumber);

  if (isRemoveJourney(req)) {
    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: `${config.UPDATE_INTERRUPT_CARD_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
      [EntityNumberKey]: entityNumber,
      errors
    });
  }

  return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
    backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
    templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
    [EntityNumberKey]: entityNumber,
    errors
  });
};

const addOeToApplicationData = async (req: Request, appData: ApplicationData, entityNumber: any, companyProfile: CompanyProfile) => {
  resetEntityUpdate(appData);
  reloadOE(appData, entityNumber, companyProfile);
  await retrieveBoAndMoData(req, appData);
  setExtraData(req.session, appData);
};

export const reloadOE = (appData: ApplicationData, entityNumber: string, companyProfile: CompanyProfile) => {
  appData.entity_name = companyProfile.companyName;
  appData.entity_number = entityNumber;
  appData.entity = mapCompanyProfileToOverseasEntity(companyProfile);
  if (appData.update) {
    appData.update.date_of_creation = mapInputDate(companyProfile.dateOfCreation);
  }
};
