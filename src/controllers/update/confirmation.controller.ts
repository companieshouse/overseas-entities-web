import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model/application.model";
import { isNoChangeJourney } from "../../utils/update/no.change.journey";
import { removeEntityCookie } from "../../utils/update/data.cookie";
import { getLoggedInUserEmail } from "../../utils/session";
import { WhoIsRegisteringType } from "../../model/who.is.making.filing.model";
import { IsRemoveKey, Transactionkey } from "../../model/data.types.model";
import { CONFIRMATION_PAGE, JourneyType } from "../../config";
import { deleteApplicationData, getApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req?.method} ${req?.route?.path}`);

    const appData: ApplicationData = await getApplicationData(req, true);
    const referenceNumber = appData[Transactionkey];

    deleteApplicationData(req.session);
    removeEntityCookie(req, res);

    if (appData[IsRemoveKey]) {
      return res.render(CONFIRMATION_PAGE, {
        journey: JourneyType.remove,
        isAgentRegistering: appData.who_is_registering === WhoIsRegisteringType.AGENT,
        referenceNumber,
        userEmail: getLoggedInUserEmail(req.session),
        verificationCheckDays: 14,
        isRemove: true,
        noChange: isNoChangeJourney(appData),
        templateName: CONFIRMATION_PAGE
      });
    }

    return res.render(CONFIRMATION_PAGE, {
      isAgentRegistering: appData.who_is_registering === WhoIsRegisteringType.AGENT,
      referenceNumber,
      userEmail: getLoggedInUserEmail(req.session),
      verificationCheckDays: 14,
      isUpdate: true,
      noChange: isNoChangeJourney(appData),
      templateName: CONFIRMATION_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
