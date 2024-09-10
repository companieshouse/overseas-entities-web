/* eslint-disable require-await */
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

export const get = async (req: Request, res: Response, next: NextFunction,) => {
  return getBeneficialOwnerGov(req, res, next, config.BENEFICIAL_OWNER_GOV_PAGE, getBeneficialOwnerTypeUrl(req));
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  return getBeneficialOwnerGovById(req, res, next, config.BENEFICIAL_OWNER_GOV_PAGE, getBeneficialOwnerTypeUrl(req));
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  return postBeneficialOwnerGov(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  return updateBeneficialOwnerGov(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  return removeBeneficialOwnerGov(req, res, next, getBeneficialOwnerTypeUrl(req));
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }

  return nextPageUrl;
};
