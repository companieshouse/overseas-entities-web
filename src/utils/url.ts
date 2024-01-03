import * as config from "../config";
import { Request } from "express";
import { ApplicationData } from "../model";
import { getApplicationData } from "./application.data";
import { Session } from "@companieshouse/node-session-handler";
import { IsRemoveKey } from "../model/data.types.model";

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
  const session = req.session as Session;

  const appData: ApplicationData = getApplicationData(session);

  if (appData) {
    if (appData[IsRemoveKey] !== undefined && appData[IsRemoveKey] !== null) {
      return appData[IsRemoveKey];
    }
  }

  // UAT-1352 Only required for remove feature flag - can be removed with it
  if (!req.query[config.JOURNEY_QUERY_PARAM] && req.url.includes("remove")) {
    return true;
  }

  return req.query[config.JOURNEY_QUERY_PARAM] === config.JourneyType.remove;
};
