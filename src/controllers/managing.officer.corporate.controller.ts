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

export const get = async (req: Request, res: Response) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  await getManagingOfficerCorporate(req, res, backLinkUrl, config.MANAGING_OFFICER_CORPORATE_PAGE);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  await getManagingOfficerCorporateById(req, res, next, backLinkUrl, config.MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req));
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPage = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPage = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPage;
};
