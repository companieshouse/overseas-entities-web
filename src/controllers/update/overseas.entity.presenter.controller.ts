import * as config from "../../config";
import { NextFunction, Request, Response } from "express";
import { getPresenterPage, postPresenterPage } from "../../utils/presenter";
import { getRedirectUrl } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_FILING_DATE_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_FILING_DATE_URL,
  });
  await getPresenterPage(req, res, next, config.UPDATE_PRESENTER_PAGE, backLinkUrl);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const redirectUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  });
  await postPresenterPage(req, res, next, redirectUrl);
};
