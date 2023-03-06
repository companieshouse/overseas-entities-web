import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyPsc } from "../../service/persons.with.signficant.control.service";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const backLinkUrl: string = config.WHO_IS_MAKING_UPDATE_PAGE;
    const changeLinkUrl: string = config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL;
    const overseasEntityHeading: string = "Check the overseas entity details (NOT LIVE)";

    return res.render(config.OVERSEAS_ENTITY_REVIEW_PAGE, {
      templateName: config.OVERSEAS_ENTITY_REVIEW_PAGE,
      backLinkUrl,
      changeLinkUrl,
      overseasEntityHeading,
      appData,
      pageParams: {
        isRegistration: false
      },
    });
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    // call getCompanyPsc service, temporary location
    if (appData.entity_number) {
      // response unused for now until mapping in UAR-337 done
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const pscData = await getCompanyPsc(req, appData.entity_number);
    }

    return res.redirect(config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
