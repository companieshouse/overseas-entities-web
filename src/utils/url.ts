import { urlParams } from "../config";
import { Request } from "express";

const getUrlWithTransactionIdAndOverseasEntityId = (url: string, transactionId: string, overseasEntityId: string): string => {
  url = url
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, transactionId)
    .replace(`:${urlParams.PARAM_OVERSEAS_ENTITY_ID}`, overseasEntityId);
  return url;
};

const getUrlWithParamsToPath = (pathToPage: string, req: Request): string => {
  return getUrlWithTransactionIdAndOverseasEntityId(pathToPage,
                                                    getTransactionIdFromRequestParams(req),
                                                    getSubmissionIdFromRequestParams(req)
  );
};

const getTransactionIdFromRequestParams = (req: Request): string => req.params[urlParams.PARAM_TRANSACTION_ID];
const getSubmissionIdFromRequestParams = (req: Request): string => req.params[urlParams.PARAM_OVERSEAS_ENTITY_ID];

export {
  getUrlWithTransactionIdAndOverseasEntityId,
  getUrlWithParamsToPath,
  getTransactionIdFromRequestParams,
  getSubmissionIdFromRequestParams
};
