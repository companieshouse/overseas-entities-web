import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../../model";
import { fetchApplicationData } from "../../utils/application.data";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";

import {
  RELEVANT_PERIOD_QUERY_PARAM,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_GOV_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
} from "../../config";

import {
  getBeneficialOwnerGov,
  postBeneficialOwnerGov,
  updateBeneficialOwnerGov,
  getBeneficialOwnerGovById,
} from "../../utils/beneficial.owner.gov";

export const get = async (req: Request, res: Response, next: NextFunction,) => {
  return await getBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, getBackLinkUrl(req));
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  return await getBeneficialOwnerGovById(req, res, next, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, getBackLinkUrl(req));
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
  if (checkRelevantPeriod(appData)) {
    await postBeneficialOwnerGov(req, res, next, getBackLinkUrl(req) + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    await postBeneficialOwnerGov(req, res, next, getBackLinkUrl(req));
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
  if (checkRelevantPeriod(appData)) {
    await updateBeneficialOwnerGov(req, res, next, getBackLinkUrl(req) + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    await updateBeneficialOwnerGov(req, res, next, getBackLinkUrl(req));
  }
};

const getBackLinkUrl = (req: Request) => {
  return getRedirectUrl({
    req,
    urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
    urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  });
};
