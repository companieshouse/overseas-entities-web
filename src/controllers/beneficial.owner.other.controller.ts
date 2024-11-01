import { NextFunction, Request, Response } from "express";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

import {
  BENEFICIAL_OWNER_OTHER_PAGE,
  BENEFICIAL_OWNER_TYPE_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL
} from "../config";

import {
  getBeneficialOwnerOther,
  getBeneficialOwnerOtherById,
  postBeneficialOwnerOther,
  removeBeneficialOwnerOther,
  updateBeneficialOwnerOther
} from "../utils/beneficial.owner.other";

export const get = async (req: Request, res: Response) => {
  await getBeneficialOwnerOther(req, res, BENEFICIAL_OWNER_OTHER_PAGE, getBeneficialOwnerTypeUrl(req));
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getBeneficialOwnerOtherById(req, res, next, BENEFICIAL_OWNER_OTHER_PAGE, getBeneficialOwnerTypeUrl(req));
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postBeneficialOwnerOther(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateBeneficialOwnerOther(req, res, next, getBeneficialOwnerTypeUrl(req));
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeBeneficialOwnerOther(req, res, next, getBeneficialOwnerTypeUrl(req));
};

const getBeneficialOwnerTypeUrl = (req: Request): string => {
  let nextPage = BENEFICIAL_OWNER_TYPE_URL;
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
    nextPage = getUrlWithParamsToPath(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL, req);
  }
  return nextPage;
};
