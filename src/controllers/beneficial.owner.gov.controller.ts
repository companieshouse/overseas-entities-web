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
import { checkRelevantPeriod } from "../utils/relevant.period";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response) => {
  return getBeneficialOwnerGov(req, res, config.BENEFICIAL_OWNER_GOV_PAGE, getBeneficialOwnerTypeUrl(req));
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  return getBeneficialOwnerGovById(req, res, next, config.BENEFICIAL_OWNER_GOV_PAGE, getBeneficialOwnerTypeUrl(req));
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerGov(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  return updateBeneficialOwnerGov(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  return removeBeneficialOwnerGov(req, res, next, getBeneficialOwnerTypeUrl(req));
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  const appData: ApplicationData = getApplicationData(req.session);
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (checkRelevantPeriod(appData)) {
    nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL + config.RELEVANT_PERIOD_QUERY_PARAM;
  }
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }

  return nextPageUrl;
};
