import { NextFunction, Request, Response } from 'express';
import { getTrustLegalEntityBo, postTrustLegalEntityBo } from '../utils/trust.legal.entity.bo';

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrustLegalEntityBo(req, res, next, false);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postTrustLegalEntityBo(req, res, next, false);
};
