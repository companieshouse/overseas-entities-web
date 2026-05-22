import { Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";

export const get = async (req: Request, res: Response) => {

  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  let applyWithPaperFormHeading: string = "You'll need to file an update using the paper form";
  const isRemove: boolean = await isRemoveJourney(req);

  const backLinkUrl = getRedirectUrl({
    req,
    urlWithEntityIds: config.SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
    urlWithoutEntityIds: config.SECURE_UPDATE_FILTER_URL,
  });

  if (isRemove) {
    applyWithPaperFormHeading = "You'll need to submit this filing using the paper form";
    return res.render(config.USE_PAPER_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: `${backLinkUrl}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      templateName: config.USE_PAPER_PAGE,
      applyWithPaperFormHeading,
      pageParams: {
        isRegistration: false
      }
    });
  }

  return res.render(config.USE_PAPER_PAGE, {
    backLinkUrl,
    templateName: config.USE_PAPER_PAGE,
    applyWithPaperFormHeading,
    pageParams: {
      isRegistration: false
    }
  });

};
