import { NextFunction, Request, Response } from "express";
import { getRedirectUrl } from "../../utils/url";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { checkRelevantPeriod } from "../../utils/relevant.period";

import {
  RELEVANT_PERIOD_QUERY_PARAM,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_OTHER_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
} from "../../config";

import {
  getBeneficialOwnerOther,
  postBeneficialOwnerOther,
  updateBeneficialOwnerOther,
  getBeneficialOwnerOtherById,
} from "../../utils/beneficial.owner.other";

export const get = async (req: Request, res: Response) => {
  await getBeneficialOwnerOther(req, res, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, getBackLinkUrl(req));
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getBeneficialOwnerOtherById(req, res, next, UPDATE_BENEFICIAL_OWNER_OTHER_PAGE, getBackLinkUrl(req));
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const appData: ApplicationData = await getApplicationData(req);
  if (checkRelevantPeriod(appData)) {
    await postBeneficialOwnerOther(req, res, next, getBackLinkUrl(req) + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    await postBeneficialOwnerOther(req, res, next, getBackLinkUrl(req));
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateBeneficialOwnerOther(req, res, next, getBackLinkUrl(req));
};

const getBackLinkUrl = (req: Request) => {
  return getRedirectUrl({
    req,
    urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
    urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  });
};
