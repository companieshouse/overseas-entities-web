import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { Session } from "@companieshouse/node-session-handler";
import { getPrivateOeDetails } from "../../service/private.overseas.entity.details";
import { updateOverseasEntity } from "../../service/overseas.entities.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_REVIEW_PAGE}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const backLinkUrl: string = config.UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL;
    const changeLinkUrl: string = config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL;
    const overseasEntityHeading: string = "Check the overseas entity details";

    // Fetch OE email address if not already in session.
    const overseasEntityId = appData.overseas_entity_id;
    if (!appData.entity?.email && overseasEntityId !== undefined) {
      if (appData.entity === undefined) {
        appData.entity = {};
      }

      // For testing:
      // const privateOeDetails = { email_address: "tester@test.com" }
      const privateOeDetails = await getPrivateOeDetails(req, overseasEntityId);
      appData.entity.email = privateOeDetails?.email_address;

      // Cache in session and save out for save&resume.
      setExtraData(session, appData);
      await updateOverseasEntity(req, session);
    }

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

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_REVIEW_PAGE}`);
    return res.redirect(config.BENEFICIAL_OWNER_STATEMENTS_PAGE);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
