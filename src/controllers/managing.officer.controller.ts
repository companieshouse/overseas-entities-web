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
  getManagingOfficer(req, res, config.BENEFICIAL_OWNER_TYPE_URL, config.MANAGING_OFFICER_PAGE);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getManagingOfficerById(req, res, next, config.BENEFICIAL_OWNER_TYPE_URL, config.MANAGING_OFFICER_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficer(req, res, next, getNextPageURL(req), true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateManagingOfficer(req, res, next, getNextPageURL(req), true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeManagingOfficer(req, res, next, getNextPageURL(req), true);
};

const getNextPageURL = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPageUrl;
};
