import { JOURNEY_QUERY_PARAM, JourneyType } from "../model/data.types.model";
import * as config from "../config";
import { Request } from "express";

export const getUrlWithTransactionIdAndSubmissionId = (url: string, transactionId: string, submissionId: string): string => {
  url = url
    .replace(`:${config.ROUTE_PARAM_TRANSACTION_ID}`, transactionId)
    .replace(`:${config.ROUTE_PARAM_SUBMISSION_ID}`, submissionId);
  return url;
};

export const getUrlWithParamsToPath = (pathToPage: string, req: Request): string => {
  return getUrlWithTransactionIdAndSubmissionId(pathToPage,
                                                getTransactionIdFromRequestParams(req),
                                                getSubmissionIdFromRequestParams(req)
  );
};

export const transactionIdAndSubmissionIdExistInRequest = (req: Request): boolean => {
  return (getTransactionIdFromRequestParams(req) !== undefined) && (getSubmissionIdFromRequestParams(req) !== undefined);
};

const getTransactionIdFromRequestParams = (req: Request): string => req.params[config.ROUTE_PARAM_TRANSACTION_ID];
const getSubmissionIdFromRequestParams = (req: Request): string => req.params[config.ROUTE_PARAM_SUBMISSION_ID];

export const urlContainsRemoveJourneyQueryParam = (req: Request): boolean => {
  return req.query[JOURNEY_QUERY_PARAM] === JourneyType.remove;
};
