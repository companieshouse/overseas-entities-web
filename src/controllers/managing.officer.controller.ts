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

export const get = async (req: Request, res: Response) => {
  await getManagingOfficer(req, res, getBeneficialOwnerTypeUrl(req), config.MANAGING_OFFICER_PAGE);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getManagingOfficerById(req, res, next, config.BENEFICIAL_OWNER_TYPE_URL, config.MANAGING_OFFICER_PAGE);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postManagingOfficer(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateManagingOfficer(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeManagingOfficer(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPageUrl;
};
