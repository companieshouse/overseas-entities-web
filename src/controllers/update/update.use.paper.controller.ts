import * as config from "../../config";
import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { isRemoveJourney } from "../../utils/url";

export const get = async (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  let applyWithPaperFormHeading: string = "You'll need to file an update using the paper form";

  if (await isRemoveJourney(req)){
    applyWithPaperFormHeading = "You'll need to submit this filing using the paper form";
    return res.render(config.USE_PAPER_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: `${config.SECURE_UPDATE_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      templateName: config.USE_PAPER_PAGE,
      applyWithPaperFormHeading,
      pageParams: {
        isRegistration: false
      }
    });
  }

  return res.render(config.USE_PAPER_PAGE, {
    backLinkUrl: config.SECURE_UPDATE_FILTER_URL,
    templateName: config.USE_PAPER_PAGE,
    applyWithPaperFormHeading,
    pageParams: {
      isRegistration: false
    }
  });
};
