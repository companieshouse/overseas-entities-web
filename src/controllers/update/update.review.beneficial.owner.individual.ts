import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { v4 as uuidv4 } from "uuid";

import { logger } from "../../utils/logger";
import { saveAndContinue } from "../../utils/save.and.continue";
import { isActiveFeature } from "../../utils/feature.flag";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.individual";
import { addCeasedDateToTemplateOptions } from "../../utils/update/ceased_date_util";
import { checkAndReviewBeneficialOwner } from "../../utils/update/review.beneficial.owner";

import { ApplicationData, ApplicationDataType } from "../../model";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { CeasedDateKey, HaveDayOfBirthKey } from "../../model/date.model";
import { AddressKeys, EntityNumberKey, InputDate } from "../../model/data.types.model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";

import {
  setApplicationData,
  fetchApplicationData,
  mapDataObjectToFields,
  removeFromApplicationData,
} from "../../utils/application.data";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  UsualResidentialAddressKey,
  UsualResidentialAddressKeys,
} from "../../model/address.model";

import {
  RELEVANT_PERIOD_QUERY_PARAM,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const index = req.query.index;
    let dataToReview = {}, serviceAddress = {}, usual_residential_address = {};

    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      checkAndReviewBeneficialOwner(req as any, appData);
    }

    if (appData?.beneficial_owners_individual) {
      dataToReview = appData?.beneficial_owners_individual[Number(index)];
      serviceAddress = (dataToReview) ? mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
      usual_residential_address = (dataToReview) ? mapDataObjectToFields(dataToReview[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys) : {};
    }

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    });

    const templateOptions = {
      ...dataToReview,
      ...serviceAddress,
      ...usual_residential_address,
      backLinkUrl,
      isBeneficialOwnersReview: true,
      populateResidentialAddress: false,
      entity_number: appData[EntityNumberKey],
      templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC),
    };

    // Ceased date is undefined and residential address is private for initial review of BO - don't set ceased date data or residential address in this scenario
    if (CeasedDateKey in dataToReview) {
      templateOptions.populateResidentialAddress = true;
      return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, addCeasedDateToTemplateOptions(templateOptions, appData, dataToReview));
    } else {
      return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, templateOptions);
    }
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const boiIndex = req.query.index;
    const requestIndex = req.body["id"];

    if (isBoReviewable(appData, boiIndex, requestIndex)) {
      checkAndReviewBeneficialOwner(req as any, appData);
    }

    if (boiIndex !== undefined && appData.beneficial_owners_individual && appData.beneficial_owners_individual[Number(boiIndex)].id === req.body["id"]) {
      const boData: BeneficialOwnerIndividual = appData.beneficial_owners_individual[Number(boiIndex)];
      const boId = boData.id;
      const dob = boData.date_of_birth as InputDate;
      const haveDayOfBirth = boData.have_day_of_birth;
      const trustIds: string[] = boData?.trust_ids?.length ? [...boData.trust_ids] : [];
      await removeFromApplicationData(req, BeneficialOwnerIndividualKey, boId, appData);
      setReviewedDateOfBirth(req, dob);
      const session = req.session as Session;
      const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

      if (haveDayOfBirth) {
        data[HaveDayOfBirthKey] = haveDayOfBirth;
      }

      if (trustIds.length > 0) {
        (data as BeneficialOwnerIndividual).trust_ids = [...trustIds];
      }

      if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        await setApplicationData(req, data, BeneficialOwnerIndividualKey);
      } else {
        await setApplicationData(req.session, data, BeneficialOwnerIndividualKey);
        await saveAndContinue(req, session);
      }
    }

    const baseRedirectUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    });

    if (checkRelevantPeriod(appData)) {
      return res.redirect(baseRedirectUrl + RELEVANT_PERIOD_QUERY_PARAM);
    }

    return res.redirect(baseRedirectUrl);

  } catch (error) {
    next(error);
  }
};

export const setReviewedDateOfBirth = (req: Request, dob: InputDate) => {
  req.body["date_of_birth-day"] = padWithZero(dob?.day, 2, "0");
  req.body["date_of_birth-month"] = padWithZero(dob?.month, 2, "0");
  req.body["date_of_birth-year"] = padWithZero(dob?.year, 2, "0");
};

export const isBoReviewable = (appData: ApplicationData, boiIndex: any, requestIndex: string | undefined): boolean => {
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && (
    !boiIndex ||
    !appData?.beneficial_owners_individual ||
    !appData?.beneficial_owners_individual[Number(boiIndex)]?.id ||
    appData.beneficial_owners_individual[Number(boiIndex)].id !== requestIndex)
  ) {
    return true;
  }
  return false;
};

export const padWithZero = (input: string, maxLength: number, fillString: string): string => {
  if (input && input.toString().length > 1) {
    return input;
  }
  return String(input).padStart(maxLength, fillString);
};
