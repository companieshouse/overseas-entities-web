import { NextFunction, Request, Response } from "express";

import {
  UPDATE_REVIEW_STATEMENT_PAGE,
  // OVERSEAS_ENTITY_SECTION_HEADING,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL
} from "../../config";
import { getDataForReview } from "../../utils/check.your.answers";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDataForReview(req, res, next, UPDATE_REVIEW_STATEMENT_PAGE, UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL, true);
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
