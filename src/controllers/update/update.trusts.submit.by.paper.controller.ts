import { logger } from "../../utils/logger";
import * as config from "../../config";
import { Request, Response } from "express";
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  const appData: ApplicationData = await getApplicationData(req.session as Session);

  const backLinkUrl = appData?.entity ? config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL : config.UPDATE_ANY_TRUSTS_INVOLVED_URL;

  return res.render(config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE, {
    backLinkUrl,
    templateName: config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE
  });
};
