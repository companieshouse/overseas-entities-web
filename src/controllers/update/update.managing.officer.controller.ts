import { NextFunction, Request, Response } from "express";

import { UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_PAGE } from "../../config";

import { getManagingOfficer, getManagingOfficerById, postManagingOfficer, removeManagingOfficer, updateManagingOfficer } from "../../utils/managing.officer.individual";

export const get = async (req: Request, res: Response) => {
  await getManagingOfficer(req, res, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_PAGE);
};

export const post = async(req: Request, res: Response, next: NextFunction) => {
  await postManagingOfficer(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  await getManagingOfficerById(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGING_OFFICER_PAGE);
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  await updateManagingOfficer(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  await removeManagingOfficer(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};
