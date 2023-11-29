import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../../model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData } from "../../utils/application.data";
import { Update } from "../../model/update.type.model";
import { Session } from "@companieshouse/node-session-handler";
import { isActiveFeature } from "../../utils/feature.flag";
import { checkEntityReviewRequiresTrusts } from "../../utils/trusts";
import { isRemoveJourney } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session as Session);
    const update = appData.update as Update;

    let journeyQuery = "";
    let journeyType = config.JourneyType.update;
    if (isRemoveJourney(req)) {
      journeyType = config.JourneyType.remove;
      journeyQuery = "?joureny=remove";
    }

    return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
      backLinkUrl: `${config.OVERSEAS_ENTITY_QUERY_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      updateUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
      appData,
      registrationDate: update.date_of_creation,
      journey: journeyType,
      journeyQuery
    });
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session as Session);

    if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_TRUSTS) && checkEntityReviewRequiresTrusts(appData)) {
      return res.redirect(config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL);
    }

    return res.redirect(config.UPDATE_FILING_DATE_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
