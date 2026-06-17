import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { getRedirectUrl } from "../../utils/url";
import { getWhoIsFiling, postWhoIsFiling } from "../../utils/who.is.making.filing";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  });
  await getWhoIsFiling(req, res, next, config.WHO_IS_MAKING_UPDATE_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const redirectUrlAgent = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_DUE_DILIGENCE_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_DUE_DILIGENCE_URL,
  });
  const redirectUrlOe = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL,
  });
  await postWhoIsFiling(req, res, next, redirectUrlAgent, redirectUrlOe);
};
