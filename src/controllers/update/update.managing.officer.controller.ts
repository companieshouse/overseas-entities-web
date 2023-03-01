import { NextFunction, Request, Response } from "express";

import { UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_PAGE } from "../../config";

import { getManagingOfficer, postManagingOfficer } from "../../utils/managing.officer.individual";

export const get = (req: Request, res: Response) => {
  getManagingOfficer(req, res, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficer(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};
