import { NextFunction, Request, Response } from "express";
import { getTrusts, postTrusts } from "../../utils/add.trust";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getTrusts(req, res, next, true);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postTrusts(req, res, next, true);
};
