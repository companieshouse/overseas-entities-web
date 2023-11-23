import * as config from "../../config";
import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import { isRemoveJourney } from "../../utils/url";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  // TODO needs to b a version of this for Remove journey.
  const applyWithPaperFormHeading: string = "You'll need to file an update using the paper form";

  if (isRemoveJourney(req)){
    return res.render(config.USE_PAPER_PAGE, {
      backLinkUrl: config.SECURE_UPDATE_FILTER_URL,
      templateName: config.USE_PAPER_PAGE,
      applyWithPaperFormHeading,
      journey: config.JourneyType.remove,
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
