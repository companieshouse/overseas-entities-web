import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import { Session } from "@companieshouse/node-session-handler";

import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

import {
  UPDATE_REVIEW_STATEMENT_PAGE,
  OVERSEAS_ENTITY_SECTION_HEADING,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL
} from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    const overseasEntityHeading: string = OVERSEAS_ENTITY_SECTION_HEADING;
    // const beneficialOwnerStatements: string = BO_STATEMENTS_SECTION_HEADING;
    // const beneficialOwners: string = BENEFICIAL_OWNERS_SECTION_HEADING;
    // const whoIsCompletingChangeLink: string = WHO_IS_MAKING_UPDATE_URL;
    const statement: string = "statement";

    return res.render(UPDATE_REVIEW_STATEMENT_PAGE, {
      backLinkUrl: UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
      templateName: UPDATE_REVIEW_STATEMENT_PAGE,
      overseasEntityHeading,
      statement,
      appData,
      pageParams: {
        // isRegistration: false
        isStatement: true
      },
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

// export const post = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     logger.debugRequest(req, `${req.method} ${req.route.path}`);

//     const session = req.session as Session;
//     const appData: ApplicationData = getApplicationData(session);

//     let transactionID, overseasEntityID;
//     if (isActiveFeature(FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME)) {
//       transactionID = appData[Transactionkey] as string;
//       overseasEntityID = appData[OverseasEntityKey] as string;
//     } else {
//       transactionID = await postTransaction(req, session);
//       overseasEntityID = await createOverseasEntity(req, session, transactionID);
//     }

//     const transactionClosedResponse = await closeTransaction(req, session, transactionID, overseasEntityID);
//     logger.infoRequest(req, `Transaction Closed, ID: ${transactionID}`);

//     const baseURL = `${CHS_URL}${UPDATE_AN_OVERSEAS_ENTITY_URL}`;
//     const redirectPath = await startPaymentsSession(
//       req,
//       session,
//       transactionID,
//       overseasEntityID,
//       transactionClosedResponse,
//       baseURL
//     );

//     logger.infoRequest(req, `Payments Session created with, Trans_ID: ${transactionID}, OE_ID: ${overseasEntityID}. Redirect to: ${redirectPath}`);

//     return res.redirect(redirectPath);
//   } catch (error) {
//     logger.errorRequest(req, error);
//     next(error);
//   }
// };
