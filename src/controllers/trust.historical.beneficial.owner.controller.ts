import { NextFunction, Request, Response } from 'express';
import { getTrustFormerBo, postTrustFormerBo } from '../utils/trust.former.bo';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getTrustFormerBo(req, res, next, false);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postTrustFormerBo(req, res, next, false);
};
