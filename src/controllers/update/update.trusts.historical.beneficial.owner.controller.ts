import { NextFunction, Request, Response } from 'express';
import { getTrustFormerBo, postTrustFormerBo } from '../../utils/trust.former.bo';

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrustFormerBo(req, res, next, true);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postTrustFormerBo(req, res, next, true);
};
