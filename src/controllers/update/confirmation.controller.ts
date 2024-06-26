import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import {
  CONFIRMATION_PAGE,
  JourneyType
} from "../../config";
import { getLoggedInUserEmail } from "../../utils/session";
import { deleteApplicationData, getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model/application.model";
import { Transactionkey } from "../../model/data.types.model";
import { WhoIsRegisteringType } from "../../model/who.is.making.filing.model";
import { isRemoveJourney } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req.session);
    const referenceNumber = appData[Transactionkey];

    // It's necessary to do this check and save the result before deleting the application
    // data (as the application data is used by the 'isRemoveJourney' function)
    const isRemove: boolean = await isRemoveJourney(req);

    deleteApplicationData(req.session);

    if (isRemove) {
      return res.render(CONFIRMATION_PAGE, {
        journey: JourneyType.remove,
        isAgentRegistering: appData.who_is_registering === WhoIsRegisteringType.AGENT,
        referenceNumber,
        userEmail: getLoggedInUserEmail(req.session),
        verificationCheckDays: 14,
        isRemove: true,
        noChange: appData.update?.no_change,
        templateName: CONFIRMATION_PAGE
      });
    }

    return res.render(CONFIRMATION_PAGE, {
      isAgentRegistering: appData.who_is_registering === WhoIsRegisteringType.AGENT,
      referenceNumber,
      userEmail: getLoggedInUserEmail(req.session),
      verificationCheckDays: 14,
      isUpdate: true,
      noChange: appData.update?.no_change,
      templateName: CONFIRMATION_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
