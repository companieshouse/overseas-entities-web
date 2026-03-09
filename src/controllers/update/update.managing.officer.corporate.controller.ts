import { NextFunction, Request, Response } from "express";
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  UPDATE_MANAGING_OFFICER_CORPORATE_PAGE
} from "../../config";
import { getRedirectUrl } from "../../utils/url";

import {
  getManagingOfficerCorporate,
  getManagingOfficerCorporateById,
  postManagingOfficerCorporate,
  removeManagingOfficerCorporate,
  updateManagingOfficerCorporate
} from "../../utils/managing.officer.corporate";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getManagingOfficerCorporate(req, res, next, getBackLinkUrl(req), UPDATE_MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postManagingOfficerCorporate(req, res, next, getBackLinkUrl(req));
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getManagingOfficerCorporateById(req, res, next, getBackLinkUrl(req), UPDATE_MANAGING_OFFICER_CORPORATE_PAGE);
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateManagingOfficerCorporate(req, res, next, getBackLinkUrl(req));
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeManagingOfficerCorporate(req, res, next, getBackLinkUrl(req));
};

const getBackLinkUrl = (req: Request) => {
  return getRedirectUrl({
    req,
    urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
    urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  });
};
