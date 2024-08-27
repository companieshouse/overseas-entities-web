import { NextFunction, Request, Response } from 'express';
import { getTrustIndividualBo, postTrustIndividualBo } from "../utils/trust.individual.beneficial.owner";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getTrustIndividualBo(req, res, next, false);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postTrustIndividualBo(req, res, next, false);
};
