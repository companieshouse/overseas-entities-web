import { NextFunction, Request, Response } from "express";
import {
  getManagingOfficer,
  getManagingOfficerById,
  postManagingOfficer,
  updateManagingOfficer,
  removeManagingOfficer
} from "../utils/managing.officer.individual";

import { BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_PAGE } from "../config";

export const get = (req: Request, res: Response) => {
  getManagingOfficer(req, res, BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_PAGE, true);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getManagingOfficerById(req, res, next, BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_PAGE, true);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficer(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateManagingOfficer(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeManagingOfficer(req, res, next, BENEFICIAL_OWNER_TYPE_URL, true);
};
