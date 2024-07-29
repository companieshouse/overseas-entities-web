import { NextFunction, Request, Response } from "express";
import { getManagingOfficerCorporate, postManagingOfficerCorporate, getManagingOfficerCorporateById, updateManagingOfficerCorporate, removeManagingOfficerCorporate } from "../../utils/managing.officer.corporate";
import { UPDATE_MANAGING_OFFICER_CORPORATE_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";

export const get = (req: Request, res: Response) => {
  getManagingOfficerCorporate(req, res, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getManagingOfficerCorporateById(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_CORPORATE_PAGE);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};
