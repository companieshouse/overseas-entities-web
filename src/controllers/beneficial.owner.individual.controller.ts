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

export const get = (req: Request, res: Response) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  getBeneficialOwnerIndividual(req, res, config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, backLinkUrl);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  getBeneficialOwnerIndividualById(req, res, next, config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, backLinkUrl);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }

  return nextPageUrl;
};
