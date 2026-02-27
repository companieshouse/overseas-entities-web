import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../../utils/logger";
import { InputDate } from "../../model/data.types.model";
import { isActiveFeature } from "../../utils/feature.flag";
import { saveAndContinue } from "../../utils/save.and.continue";
import { setOfficerData } from "../../utils/managing.officer.individual";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { ManagingOfficerKey } from "../../model/managing.officer.model";
import { setReviewedDateOfBirth } from "./update.review.beneficial.owner.individual";
import { addResignedDateToTemplateOptions } from "../../utils/update/ceased_date_util";

import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { HaveDayOfBirthKey, ResignedOnKey } from "../../model/date.model";
import { ApplicationData, ApplicationDataType } from "../../model";

import {
  fetchIndividualMOAddress,
  checkAndReviewManagingOfficers,
} from "../../utils/update/review.managing.officer";

import {
  setApplicationData,
  fetchApplicationData,
  removeFromApplicationData,
} from "../../utils/application.data";

import {
  RELEVANT_PERIOD_QUERY_PARAM,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const index = Number(req.query.index);
    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      checkAndReviewManagingOfficers(req as any, appData);
    }
    const { dataToReview, residentialAddress, serviceAddress } = fetchIndividualMOAddress(appData, index);

    const templateOptions = {
      ...dataToReview,
      ...residentialAddress,
      ...serviceAddress,
      templateName: UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE,
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
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const requestId = req.body["id"];

    if (isMoReviewable(appData, moIndex, requestId)) {
      checkAndReviewManagingOfficers(req as any, appData);
    }

    if (moIndex !== undefined &&
        appData?.managing_officers_individual &&
        appData.managing_officers_individual[Number(moIndex)].id === requestId
    ) {

      const moId = appData.managing_officers_individual[Number(moIndex)].id;
      const dob = appData.managing_officers_individual[Number(moIndex)].date_of_birth as InputDate;
      const haveDayOfBirth = appData.managing_officers_individual[Number(moIndex)].have_day_of_birth;
      await removeFromApplicationData(req, ManagingOfficerKey, moId, appData);
      setReviewedDateOfBirth(req, dob);
      const session = req.session as Session;
      const data: ApplicationDataType = setOfficerData(req.body, uuidv4());

      if (haveDayOfBirth) {
        data[HaveDayOfBirthKey] = haveDayOfBirth;
      }

      if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        await setApplicationData(req, data, ManagingOfficerKey);
      } else {
        await setApplicationData(req.session, data, ManagingOfficerKey);
        await saveAndContinue(req, session);
      }
    }

    const boTypeRedirectUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    });

    if (checkRelevantPeriod(appData)) {
      return res.redirect(boTypeRedirectUrl + RELEVANT_PERIOD_QUERY_PARAM);
    } else {
      return res.redirect(boTypeRedirectUrl);
    }
  } catch (error) {
    next(error);
  }
};

export const isMoReviewable = (appData: ApplicationData, moIndex: any, requestId: string | undefined): boolean => {
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && (
    !moIndex ||
      !appData?.managing_officers_individual ||
      !appData?.managing_officers_individual[Number(moIndex)]?.id ||
      appData.managing_officers_individual[Number(moIndex)].id !== requestId)
  ) {
    return true;
  }
  return false;
};
