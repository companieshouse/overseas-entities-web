import { NextFunction, Request, Response } from "express";
import {
  getManagingOfficer,
  getManagingOfficerById,
  postManagingOfficer,
  updateManagingOfficer,
  removeManagingOfficer
} from "../utils/managing.officer.individual";

import * as config from "../config";

import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response) => {
  getManagingOfficer(req, res, getBeneficialOwnerTypeUrl(req), config.MANAGING_OFFICER_PAGE);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  getManagingOfficerById(req, res, next, backLinkUrl, config.MANAGING_OFFICER_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficer(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateManagingOfficer(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeManagingOfficer(req, res, next, getBeneficialOwnerTypeUrl(req));
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPageUrl;
};
