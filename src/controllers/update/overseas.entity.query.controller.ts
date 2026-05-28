import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { RemoveKey } from "../../model/remove.type.model";
import { mapInputDate } from "../../utils/update/mapper.utils";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { isActiveFeature } from "../../utils/feature.flag";
import { ApplicationData } from "../../model";
import { postTransaction } from "../../service/transaction.service";
import { resetEntityUpdate } from "../../utils/update/update.reset";
import { getCompanyProfile } from "../../service/company.profile.service";
import { retrieveBoAndMoData } from "../../utils/update/beneficial_owners_managing_officers_data_fetch";
import { mapCompanyProfileToOverseasEntity } from "../../utils/update/company.profile.mapper.to.overseas.entity";
import { getDataFromEntityCookie, saveDataToCookie } from "../../utils/update/data.cookie";
import { createOverseasEntity, updateOverseasEntity } from "../../service/overseas.entities.service";

import {
  getRemove,
  setExtraData,
  getApplicationData,
} from "../../utils/application.data";

import {
  getRedirectUrl,
  isRemoveJourney,
  getUrlWithTransactionIdAndSubmissionId,
} from "../../utils/url";

import {
  IsRemoveKey,
  Transactionkey,
  EntityNumberKey,
  OverseasEntityKey,
  IsSecureRegisterKey,
} from "../../model/data.types.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await getAppData(req, false);

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_INTERRUPT_CARD_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_INTERRUPT_CARD_URL,
    });

    if (isRemove) {
      return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
        chsUrl: process.env.CHS_URL,
        journey: config.JourneyType.remove,
        [EntityNumberKey]: appData[EntityNumberKey],
        templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
        backLinkUrl: `${backLinkUrl}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      });
    }

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl,
      chsUrl: process.env.CHS_URL,
      [EntityNumberKey]: appData[EntityNumberKey],
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
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
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await getAppData(req);

    if (appData?.entity_number !== entityNumber) {
      const companyProfile = await getCompanyProfile(req, entityNumber);
      if (!companyProfile) {
        return await renderGetPageWithError(req, res, entityNumber);
      }
      await addOeToApplicationData(req, res, appData, entityNumber, companyProfile, isRemove);
      saveToCookie(req, res, entityNumber);
    }

    const nextPageUrl = getNextPageUrl(req, appData);

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
      errors,
      [EntityNumberKey]: entityNumber,
      journey: config.JourneyType.remove,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_INTERRUPT_CARD_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_INTERRUPT_CARD_URL,
      }) + config.JOURNEY_REMOVE_QUERY_PARAM,
    });
  }

  return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
    backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
    templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
    [EntityNumberKey]: entityNumber,
    errors
  });
};

const addOeToApplicationData = async (
  req: Request,
  res: Response,
  appData: ApplicationData,
  entityNumber: any,
  companyProfile: CompanyProfile,
  isRemove: boolean
) => {
  resetEntityUpdate(appData);
  reloadOE(appData, entityNumber, companyProfile);
  await retrieveBoAndMoData(req, appData);
  await saveEntityDetails(req, res, appData, isRemove);
  setExtraData(req.session as Session, appData);
};

export const reloadOE = (appData: ApplicationData, entityNumber: string, companyProfile: CompanyProfile) => {
  appData.entity_name = companyProfile.companyName;
  appData.entity_number = entityNumber;
  appData.entity = mapCompanyProfileToOverseasEntity(companyProfile);
  if (appData.update) {
    appData.update.date_of_creation = mapInputDate(companyProfile.dateOfCreation);
  }
};

export const saveToCookie = (req: Request, res: Response, entityNumber: string) => {
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    saveDataToCookie(req, res, EntityNumberKey, entityNumber);
  }
};

const saveEntityDetails = async (
  req: Request,
  res: Response,
  appData: ApplicationData,
  isRemove: boolean
): Promise<void> => {
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    const session = req.session as Session;
    if (!appData[Transactionkey]) {
      const transactionID = await postTransaction(req, session);
      appData[Transactionkey] = transactionID;
      appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID);
    }
    const cookieData = await getDataFromEntityCookie(req, false);
    if (isRemove) {
      appData[IsRemoveKey] = true;
      appData[RemoveKey] = getRemove(cookieData);
    }
    appData[IsSecureRegisterKey] = cookieData[IsSecureRegisterKey];
    await updateOverseasEntity(req, req.session as Session, appData);
  }
};

export const getNextPageUrl = (req: Request, appData: ApplicationData) => {
  if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    return config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL;
  }

  if (appData[Transactionkey] && appData[OverseasEntityKey]) {
    return getUrlWithTransactionIdAndSubmissionId(
      config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL,
        appData[Transactionkey] as string,
        appData[OverseasEntityKey] as string
    );
  }

  return getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
  });

};

const getAppData = async (req: Request, getCompany: boolean = true): Promise<ApplicationData> => {
  let appData: ApplicationData = await getApplicationData(req);
  if (!Object.keys(appData).length) {
    appData = await getDataFromEntityCookie(req, getCompany);
  }
  return appData;
};
