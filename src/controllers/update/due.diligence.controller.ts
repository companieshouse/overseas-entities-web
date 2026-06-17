import { NextFunction, Request, Response } from "express";
import { getRedirectUrl } from "../../utils/url";
import { getDueDiligencePage, postDueDiligencePage } from "../../utils/due.diligence";
import {
  WHO_IS_MAKING_UPDATE_URL,
  UPDATE_DUE_DILIGENCE_PAGE,
  WHO_IS_MAKING_UPDATE_WITH_PARAMS_URL,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_WITH_PARAMS_URL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = getRedirectUrl({
    req,
    urlWithEntityIds: WHO_IS_MAKING_UPDATE_WITH_PARAMS_URL,
    urlWithoutEntityIds: WHO_IS_MAKING_UPDATE_URL,
  });
  await getDueDiligencePage(req, res, next, UPDATE_DUE_DILIGENCE_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const redirectUrl = getRedirectUrl({
    req,
    urlWithEntityIds: UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_WITH_PARAMS_URL,
    urlWithoutEntityIds: UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
  });
  await postDueDiligencePage(req, res, next, redirectUrl);
};
