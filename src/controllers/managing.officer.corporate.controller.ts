import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import {
  getManagingOfficerCorporate,
  getManagingOfficerCorporateById,
  postManagingOfficerCorporate,
  updateManagingOfficerCorporate,
  removeManagingOfficerCorporate
} from "../utils/managing.officer.corporate";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response) => {
  getManagingOfficerCorporate(req, res, config.BENEFICIAL_OWNER_TYPE_URL, config.MANAGING_OFFICER_CORPORATE_PAGE);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getManagingOfficerCorporateById(req, res, next, config.BENEFICIAL_OWNER_TYPE_URL, config.MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPage = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPage = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPage;
};
