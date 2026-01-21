import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { getRedirectUrl } from "../../utils/url";
import { getDueDiligence, postDueDiligence } from "../../utils/overseas.due.diligence";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.WHO_IS_MAKING_UPDATE_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.WHO_IS_MAKING_UPDATE_URL,
  });
  await getDueDiligence(req, res, next, config.UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const redirectUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
  });
  await postDueDiligence(req, res, next, redirectUrl);
};
