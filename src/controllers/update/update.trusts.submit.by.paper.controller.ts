import { Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { getRedirectUrl } from "../../utils/url";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData: ApplicationData = await getApplicationData(req);
  const backLinkUrl = getBackLinkUrl(req, appData);
  return res.render(config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE, {
    backLinkUrl,
    templateName: config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE
  });
};

const getBackLinkUrl = (req: Request, appData: ApplicationData) => {
  if (appData?.entity) {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
    });
  } else {
    return getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_ANY_TRUSTS_INVOLVED_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_ANY_TRUSTS_INVOLVED_URL,
    });
  }
};
