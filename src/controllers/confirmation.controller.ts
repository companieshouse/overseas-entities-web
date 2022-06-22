import { Request, Response } from "express";

import { logger } from "../utils/logger";
import { CONFIRMATION_PAGE } from "../config";
import { getLoggedInUserEmail } from "../utils/session";
import { deleteApplicationData, getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model/application.model";
import { Transactionkey } from "../model/data.types.model";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${CONFIRMATION_PAGE}`);

  const appData: ApplicationData = getApplicationData(req.session);
  const referenceNumber = appData[Transactionkey];

  deleteApplicationData(req.session);

  return res.render(CONFIRMATION_PAGE, {
    referenceNumber,
    userEmail: getLoggedInUserEmail(req.session),
    workingDays: 2, // Not yet defined.
    templateName: CONFIRMATION_PAGE
  });
};
