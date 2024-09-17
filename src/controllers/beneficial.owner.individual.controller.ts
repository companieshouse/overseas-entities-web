import { NextFunction, Request, Response } from "express";

import {
  getBeneficialOwnerIndividual,
  getBeneficialOwnerIndividualById,
  postBeneficialOwnerIndividual,
  removeBeneficialOwnerIndividual,
  updateBeneficialOwnerIndividual
} from "../utils/beneficial.owner.individual";

import * as config from "../config";

import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";
import { checkRelevantPeriod } from "../utils/relevant.period";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";

export const get = async (req: Request, res: Response) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  await getBeneficialOwnerIndividual(req, res, config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, backLinkUrl);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  await getBeneficialOwnerIndividualById(req, res, next, config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req));
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }

  return nextPageUrl;
};

const getRemoveBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  const appData: ApplicationData = getApplicationData(req.session);
  if (checkRelevantPeriod(appData)) {
    nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
  }
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPageUrl;
};
