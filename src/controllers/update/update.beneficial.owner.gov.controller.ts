/* eslint-disable require-await */
import { NextFunction, Request, Response } from "express";
import { UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL, RELEVANT_PERIOD_QUERY_PARAM } from "../../config";
import {
  getBeneficialOwnerGov,
  getBeneficialOwnerGovById,
  postBeneficialOwnerGov,
  updateBeneficialOwnerGov
} from "../../utils/beneficial.owner.gov";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = (req: Request, res: Response) => {
  const appData: ApplicationData = getApplicationData(req.session);
  if (checkRelevantPeriod(appData)) {
    return getBeneficialOwnerGov(req, res, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    return getBeneficialOwnerGov(req, res, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  }
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  const appData: ApplicationData = getApplicationData(req.session);
  if (checkRelevantPeriod(appData)) {
    return getBeneficialOwnerGovById(req, res, next, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    return getBeneficialOwnerGovById(req, res, next, UPDATE_BENEFICIAL_OWNER_GOV_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const appData: ApplicationData = await getApplicationData(req.session);
  if (checkRelevantPeriod(appData)) {
    await postBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    await postBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const appData: ApplicationData = await getApplicationData(req.session);
  if (checkRelevantPeriod(appData)) {
    await updateBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
  } else {
    await updateBeneficialOwnerGov(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  }
};
