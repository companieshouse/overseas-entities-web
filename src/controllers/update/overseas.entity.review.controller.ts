import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { Session } from "@companieshouse/node-session-handler";
import { getPrivateOeDetails } from "../../service/private.overseas.entity.details";
import { updateOverseasEntity } from "../../service/overseas.entities.service";
import { isActiveFeature } from '../../utils/feature.flag';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_REVIEW_PAGE}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    if (!isActiveFeature(config.FEATURE_FLAG_DISABLE_UPDATE_PRIVATE_DATA_FETCH)) {

      // Fetch OE email address if not already in session.
      const overseasEntityId = appData.overseas_entity_id;
      const transactionId = appData.transaction_id;
      if (appData.entity === undefined) {
        appData.entity = {};
      }
      if (!appData.entity.email && overseasEntityId !== undefined && transactionId !== undefined) {
        const privateOeDetails = await getPrivateOeDetails(req, transactionId, overseasEntityId);
        if (privateOeDetails === undefined || privateOeDetails.email_address === undefined || privateOeDetails.email_address.length === 0) {
          const message = `Private OE Details not found for overseas entity ${appData.entity_number}`;
          logger.errorRequest(req, message);
          throw new Error(message);
        }
        appData.entity.email = privateOeDetails.email_address;

        // Cache in session and save out for save&resume.
        setExtraData(session, appData);
        await updateOverseasEntity(req, session);
      }
    }

    return res.redirect(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);

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

