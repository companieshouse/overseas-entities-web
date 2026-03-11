import { NextFunction, Request, Response } from "express";
import { getRedirectUrl } from "../../utils/url";

import {
  getManagingOfficer,
  postManagingOfficer,
  removeManagingOfficer,
  updateManagingOfficer,
  getManagingOfficerById,
} from "../../utils/managing.officer.individual";

import {
  UPDATE_MANAGING_OFFICER_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response) => {
  await getManagingOfficer(req, res, getBackLinkUrl(req), UPDATE_MANAGING_OFFICER_PAGE);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postManagingOfficer(req, res, next, getBackLinkUrl(req));
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getManagingOfficerById(req, res, next, getBackLinkUrl(req), UPDATE_MANAGING_OFFICER_PAGE);
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateManagingOfficer(req, res, next, getBackLinkUrl(req));
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeManagingOfficer(req, res, next, getBackLinkUrl(req));
};

const getBackLinkUrl = (req: Request) => {
  return getRedirectUrl({
    req,
    urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
    urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  });
};
