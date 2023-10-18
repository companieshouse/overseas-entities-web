import { NextFunction, Request, Response } from "express";

import {
  getBeneficialOwnerIndividual,
  getBeneficialOwnerIndividualById,
  postBeneficialOwnerIndividual,
  removeBeneficialOwnerIndividual,
  updateBeneficialOwnerIndividual
} from "../utils/beneficial.owner.individual";

import * as config from "../config";

import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerIndividual(req, res, config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, config.BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerIndividualById(req, res, next, config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE, config.BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  let nextPageUrl = config.BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
    nextPageUrl = getUrlWithParamsToPath(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }

  postBeneficialOwnerIndividual(req, res, next, nextPageUrl, true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerIndividual(req, res, next, config.BENEFICIAL_OWNER_TYPE_URL, true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeBeneficialOwnerIndividual(req, res, next, config.BENEFICIAL_OWNER_TYPE_URL, true);
};
