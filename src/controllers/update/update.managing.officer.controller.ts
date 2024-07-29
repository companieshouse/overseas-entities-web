import { NextFunction, Request, Response } from "express";

import { UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_PAGE } from "../../config";

import { getManagingOfficer, getManagingOfficerById, postManagingOfficer, removeManagingOfficer, updateManagingOfficer } from "../../utils/managing.officer.individual";

export const get = (req: Request, res: Response) => {
  getManagingOfficer(req, res, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_PAGE);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postManagingOfficer(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getManagingOfficerById(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_PAGE);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateManagingOfficer(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeManagingOfficer(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};
