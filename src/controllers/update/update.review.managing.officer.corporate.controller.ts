import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../utils/logger";
import { AddressKeys } from "../../model/data.types.model";
import { ResignedOnKey } from "../../model/date.model";
import { setOfficerData } from "../../utils/managing.officer.corporate";
import { isActiveFeature } from "../../utils/feature.flag";
import { saveAndContinue } from "../../utils/save.and.continue";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { checkAndReviewManagingOfficers } from "../../utils/update/review.managing.officer";
import { addResignedDateToTemplateOptions } from "../../utils/update/ceased_date_util";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { ApplicationData, ApplicationDataType } from "../../model";

import {
  setApplicationData,
  fetchApplicationData,
  mapDataObjectToFields,
  removeFromApplicationData,
} from "../../utils/application.data";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  PrincipalAddressKey,
  PrincipalAddressKeys,
} from "../../model/address.model";

import {
  RELEVANT_PERIOD_QUERY_PARAM,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const index = req.query.index;
    let dataToReview = {}, principalAddress = {}, serviceAddress = {};
    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      checkAndReviewManagingOfficers(req as any, appData);
    }

    if (appData?.managing_officers_corporate) {
      dataToReview = appData.managing_officers_corporate[Number(index)];
      if (dataToReview) {
        principalAddress = mapDataObjectToFields(dataToReview[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys);
        serviceAddress = mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys);
      }
    }

    const templateOptions = {
      ...dataToReview,
      ...principalAddress,
      ...serviceAddress,
      templateName: UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE,
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
      }),
    };

    if (ResignedOnKey in dataToReview) {
      return res.render(templateOptions.templateName, addResignedDateToTemplateOptions(templateOptions, appData, dataToReview));
    } else {
      return res.render(templateOptions.templateName, templateOptions);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const moIndex = req.query.index;
    const requestId = req.body["id"];
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);

    if (isMoReviewable(appData, moIndex, requestId)) {
      checkAndReviewManagingOfficers(req as any, appData);
    }

    if (moIndex !== undefined &&
        appData?.managing_officers_corporate &&
        appData.managing_officers_corporate[Number(moIndex)].id === requestId
    ) {

      const moId = appData.managing_officers_corporate[Number(moIndex)].id;
      await removeFromApplicationData(req, ManagingOfficerCorporateKey, moId, appData);
      const data: ApplicationDataType = setOfficerData(req.body, moId);
      const session = req.session as Session;

      if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        await setApplicationData(req, data, ManagingOfficerCorporateKey);
      } else {
        await setApplicationData(session, data, ManagingOfficerCorporateKey);
        await saveAndContinue(req, session);
      }
    }

    const boRedirectUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    });

    if (checkRelevantPeriod(appData)) {
      return res.redirect(boRedirectUrl + RELEVANT_PERIOD_QUERY_PARAM);
    } else {
      return res.redirect(boRedirectUrl);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const isMoReviewable = (appData: ApplicationData, moIndex: any, requestId: string | undefined): boolean => {
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) &&
      (!moIndex ||
      !appData?.managing_officers_corporate ||
      !appData?.managing_officers_corporate[Number(moIndex)]?.id ||
      appData.managing_officers_corporate[Number(moIndex)].id !== requestId)
  ) {
    return true;
  }
  return false;
};
