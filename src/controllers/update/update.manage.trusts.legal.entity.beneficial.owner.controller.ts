import { NextFunction, Request, Response } from 'express';
import { TrusteeType } from '../../model/trustee.type.model';
import { getTrusteePage, postTrusteePage } from '../../utils/update/review.individuals.or.entities.invovled';

export const get = (req: Request, res: Response, next: NextFunction) => {
  getTrusteePage(req, res, next, TrusteeType.LEGAL_ENTITY);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postTrusteePage(req, res, next, TrusteeType.LEGAL_ENTITY);
};
