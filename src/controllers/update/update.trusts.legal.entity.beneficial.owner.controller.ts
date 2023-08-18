import { NextFunction, Request, Response } from 'express';
import { getTrustLegalEntityBo, postTrustLegalEntityBo } from '../../utils/trust.legal.entity.bo';

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrustLegalEntityBo(req, res, next, true);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postTrustLegalEntityBo(req, res, next, true);
};
