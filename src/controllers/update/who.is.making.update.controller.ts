import { NextFunction, Request, Response } from "express";

import {
  WHO_IS_MAKING_UPDATE_PAGE,
  UPDATE_DUE_DILIGENCE_URL,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL
} from "../../config";
import { getWhoIsFiling, postWhoIsFiling } from "../../utils/who.is.making.filing";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getWhoIsFiling(req, res, next, WHO_IS_MAKING_UPDATE_PAGE, UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postWhoIsFiling(req, res, next, UPDATE_DUE_DILIGENCE_URL, UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);
};
