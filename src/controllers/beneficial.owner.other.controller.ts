import { NextFunction, Request, Response } from "express";
import {
  BENEFICIAL_OWNER_OTHER_PAGE,
  BENEFICIAL_OWNER_TYPE_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL
} from "../config";
import { isActiveFeature } from "../utils/feature.flag";
import {
  getBeneficialOwnerOther,
  getBeneficialOwnerOtherById,
  postBeneficialOwnerOther,
  removeBeneficialOwnerOther,
  updateBeneficialOwnerOther
} from "../utils/beneficial.owner.other";
import { getUrlWithParamsToPath } from "../utils/url";

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerOther(req, res, BENEFICIAL_OWNER_OTHER_PAGE, getBeneficialOwnerTypeUrl(req));
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerOtherById(req, res, next, BENEFICIAL_OWNER_OTHER_PAGE, getBeneficialOwnerTypeUrl(req));
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerOther(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerOther(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeBeneficialOwnerOther(req, res, next, getBeneficialOwnerTypeUrl(req));
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPage = BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPage = getUrlWithParamsToPath(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPage;
};
