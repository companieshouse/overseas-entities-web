import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

import {
  getBeneficialOwnerIndividual,
  getBeneficialOwnerIndividualById,
  postBeneficialOwnerIndividual,
  removeBeneficialOwnerIndividual,
  updateBeneficialOwnerIndividual
} from "../utils/beneficial.owner.individual";

export const get = async (req: Request, res: Response) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  await getBeneficialOwnerIndividual(req, res, config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, backLinkUrl);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)
    ? getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req)
    : config.BENEFICIAL_OWNER_TYPE_URL;
  await getBeneficialOwnerIndividualById(req, res, next, config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeBeneficialOwnerIndividual(req, res, next, getBeneficialOwnerTypeUrl(req));
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPageUrl;
};
