import { NextFunction, Request, Response } from "express";
import { getManagingOfficerCorporate, postManagingOfficerCorporate } from "../../utils/managing.officer.corporate";
import { UPDATE_MANAGING_OFFICER_CORPORATE_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";

export const get = (req: Request, res: Response) => {
  getManagingOfficerCorporate(req, res, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_CORPORATE_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficerCorporate(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};
