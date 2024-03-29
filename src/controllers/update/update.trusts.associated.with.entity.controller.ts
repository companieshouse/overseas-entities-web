import { NextFunction, Request, Response } from "express";
import { getTrusts, postTrusts } from "../../utils/add.trust";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrusts(req, res, next, true);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postTrusts(req, res, next, true);
};
