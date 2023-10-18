import { NextFunction, Request, Response } from "express";
import {
  BENEFICIAL_OWNER_TYPE_URL,
  BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  MANAGING_OFFICER_CORPORATE_PAGE,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL
} from "../config";
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
  getManagingOfficerCorporate(req, res, nextOrLastPage(req), MANAGING_OFFICER_CORPORATE_PAGE);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getManagingOfficerCorporateById(req, res, next, nextOrLastPage(req), MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficerCorporate(req, res, next, nextOrLastPage(req), true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateManagingOfficerCorporate(req, res, next, nextOrLastPage(req), true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeManagingOfficerCorporate(req, res, next, nextOrLastPage(req), true);
};

const nextOrLastPage = (req: Request): string => {
  let nextPage = BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPage = getUrlWithParamsToPath(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPage;
};
