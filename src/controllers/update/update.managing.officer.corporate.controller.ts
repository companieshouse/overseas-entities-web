import { NextFunction, Request, Response } from "express";

import {
  UPDATE_MANAGING_OFFICER_CORPORATE_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
} from "../../config";

import {
  getManagingOfficerCorporate,
  postManagingOfficerCorporate,
  getManagingOfficerCorporateById,
  updateManagingOfficerCorporate,
  removeManagingOfficerCorporate
} from "../../utils/managing.officer.corporate";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getManagingOfficerCorporateById(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_CORPORATE_PAGE);
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};
