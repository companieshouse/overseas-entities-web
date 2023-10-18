import { NextFunction, Request, Response } from "express";
import {
  getBeneficialOwnerGov,
  getBeneficialOwnerGovById,
  postBeneficialOwnerGov,
  removeBeneficialOwnerGov,
  updateBeneficialOwnerGov
} from "../utils/beneficial.owner.gov";

import * as config from "../config";

import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response) => {
  return getBeneficialOwnerGov(req, res, config.BENEFICIAL_OWNER_GOV_PAGE, config.BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  return getBeneficialOwnerGovById(req, res, next, config.BENEFICIAL_OWNER_GOV_PAGE, config.BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerGov(req, res, next, getNextPageUrl(req), true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  return updateBeneficialOwnerGov(req, res, next, getNextPageUrl(req), true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  return removeBeneficialOwnerGov(req, res, next, getNextPageUrl(req), true);
};

const getNextPageUrl = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }

  return nextPageUrl;
};
