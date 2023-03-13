import { NextFunction, Request, Response } from "express";
import { BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_CORPORATE_PAGE } from "../config";
import {
  getManagingOfficerCorporate,
  getManagingOfficerCorporateById,
  postManagingOfficerCorporate,
  updateManagingOfficerCorporate,
  removeManagingOfficerCorporate
} from "../utils/managing.officer.corporate";

export const get = (req: Request, res: Response) => {
  getManagingOfficerCorporate(req, res, BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_CORPORATE_PAGE);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getManagingOfficerCorporateById(req, res, next, BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficerCorporate(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateManagingOfficerCorporate(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeManagingOfficerCorporate(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};
