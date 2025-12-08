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
import { getBackLinkOrNextUrl, isRemoveJourney } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req, true);
    const isRemove: boolean = await isRemoveJourney(req);

    if (isRemove) {
      return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
        journey: config.JourneyType.remove,
        backLinkUrl: `${config.UPDATE_INTERRUPT_CARD_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
        templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
        chsUrl: process.env.CHS_URL,
        [EntityNumberKey]: appData[EntityNumberKey]
      });
    }

    const backLinkUrl = getBackLinkOrNextUrl({
      req,
      urlWithEntityIds: config.UPDATE_INTERRUPT_CARD_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_INTERRUPT_CARD_URL,
    });

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl,
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
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await getApplicationData(req, true);

    if (!companyProfile) {
      return await renderGetPageWithError(req, res, entityNumber);
    }

    if (appData.entity_number !== entityNumber) {
      await addOeToApplicationData(req, appData, entityNumber, companyProfile);
    }

    const nextPageUrl = getBackLinkOrNextUrl({
      req,
      urlWithEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
    });

    if (isRemove) {
      return res.redirect(`${nextPageUrl}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    }

    return res.redirect(nextPageUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

function createEntityNumberError(): any {
  const msg = `Enter a correct Overseas Entity ID.`;
  const errors = { errorList: [] } as any;
  errors.errorList.push({ href: "#entity_number", text: msg });
  errors.entity_number = { text: msg };
  return errors;
}

const renderGetPageWithError = async (req: Request, res: Response, entityNumber: any) => {
  const errors = createEntityNumberError();
  const isRemove: boolean = await isRemoveJourney(req);

  if (isRemove) {
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
