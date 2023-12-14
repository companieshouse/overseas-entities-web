import * as config from "../config";
import { Request } from "express";
import { ApplicationData } from "../model";

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

export const isRemoveJourney = (req: Request): boolean => {
  return req.query[config.JOURNEY_QUERY_PARAM] === config.JourneyType.remove;
};

export const isRemoveJourneyInSession = (appData: ApplicationData ): boolean => {
  if (appData) {
    if (appData.is_remove === true) {
      return true;
    }
  }
  return false;
};
