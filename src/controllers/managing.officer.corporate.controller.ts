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
  let backLinkUrl: string = config.MANAGING_OFFICER_CORPORATE_PAGE;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    backLinkUrl = getUrlWithParamsToPath(config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL, req);
  }
  await getManagingOfficerCorporate(req, res, backLinkUrl, config.MANAGING_OFFICER_CORPORATE_PAGE);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getManagingOfficerCorporateById(req, res, next, config.BENEFICIAL_OWNER_TYPE_URL, config.MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeManagingOfficerCorporate(req, res, next, getBeneficialOwnerTypeUrl(req), true);
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPage = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPage = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPage;
};
