import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { getRedirectUrl } from "../../utils/url";
import { getBeneficialOwnerStatements, postBeneficialOwnerStatements } from "../../utils/beneficial.owner.statements";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  const backLinkUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  });
  await getBeneficialOwnerStatements(req, resp, next, false, backLinkUrl);
};

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  const noChangeUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  });
  await postBeneficialOwnerStatements(req, resp, next, false, noChangeUrl);
};
