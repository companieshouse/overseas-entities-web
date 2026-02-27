import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@companieshouse/node-session-handler";

import { logger } from "../../utils/logger";
import { ApplicationData, ApplicationDataType } from "../../model";
import { saveAndContinue } from "../../utils/save.and.continue";
import { AddressKeys } from "../../model/data.types.model";
import { CeasedDateKey } from "../../model/date.model";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";
import { isActiveFeature } from "../../utils/feature.flag";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { setBeneficialOwnerData } from "../../utils/beneficial.owner.gov";
import { BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import { checkAndReviewBeneficialOwner } from "../../utils/update/review.beneficial.owner";
import { addCeasedDateToTemplateOptions } from "../../utils/update/ceased_date_util";

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
  UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE,
  UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC,
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
      checkAndReviewBeneficialOwner(req as any, appData);
    }

    if (appData?.beneficial_owners_government_or_public_authority) {
      dataToReview = appData?.beneficial_owners_government_or_public_authority[Number(index)];
      if (dataToReview) {
        principalAddress = mapDataObjectToFields(dataToReview[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys);
        serviceAddress = mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys);
      }
    }

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    });

    const templateOptions = {
      ...dataToReview,
      ...principalAddress,
      ...serviceAddress,
      backLinkUrl,
      templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE,
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC),
    };

    if (CeasedDateKey in dataToReview) {
      return res.render(templateOptions.templateName, addCeasedDateToTemplateOptions(templateOptions, appData, dataToReview));
    } else {
      return res.render(templateOptions.templateName, templateOptions);
    }
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    const boiIndex = req.query.index;
    const requestId = req.body["id"];

    if (isBoReviewable(appData, boiIndex, requestId)) {
      checkAndReviewBeneficialOwner(req as any, appData);
    }

    if (boiIndex !== undefined &&
        appData?.beneficial_owners_government_or_public_authority &&
        appData.beneficial_owners_government_or_public_authority[Number(boiIndex)].id === requestId
    ) {

      const boId = appData.beneficial_owners_government_or_public_authority[Number(boiIndex)].id;
      await removeFromApplicationData(req, BeneficialOwnerGovKey, boId, appData);
      const session = req.session as Session;
      const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

      if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
        await setApplicationData(req, data, BeneficialOwnerGovKey);
      } else {
        await setApplicationData(req.session, data, BeneficialOwnerGovKey);
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

export const isBoReviewable = (appData: ApplicationData, boiIndex: any, requestId: string | undefined): boolean => {
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && (
    !boiIndex ||
      !appData?.beneficial_owners_government_or_public_authority ||
      !appData?.beneficial_owners_government_or_public_authority[Number(boiIndex)]?.id ||
      appData?.beneficial_owners_government_or_public_authority[Number(boiIndex)]?.id !== requestId)
  ) {
    return true;
  }
  return false;
};

