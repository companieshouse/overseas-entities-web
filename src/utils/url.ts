import * as config from "../config";
import { Request } from "express";

export const getUrlWithTransactionIdAndOverseasEntityId = (url: string, transactionId: string, overseasEntityId: string): string => {
  url = url
    .replace(`:${config.ROUTE_PARAM_TRANSACTION_ID}`, transactionId)
    .replace(`:${config.ROUTE_PARAM_OVERSEAS_ENTITY_ID}`, overseasEntityId);
  return url;
};

export const getUrlWithParamsToPath = (pathToPage: string, req: Request): string => {
  return getUrlWithTransactionIdAndOverseasEntityId(pathToPage,
                                                    getTransactionIdFromRequestParams(req),
                                                    getSubmissionIdFromRequestParams(req)
  );
};

export const getTransactionIdFromRequestParams = (req: Request): string => req.params[config.ROUTE_PARAM_TRANSACTION_ID];
export const getSubmissionIdFromRequestParams = (req: Request): string => req.params[config.ROUTE_PARAM_OVERSEAS_ENTITY_ID];
