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

  if (req.url !== undefined && req.url.includes(config.REMOVE_URL_IDENTIFIER)) {
    return true;
  }

  return req.query[config.JOURNEY_QUERY_PARAM] === config.JourneyType.remove;
};

export const getQueryParamsMinusRemoveJourney = (req: Request) => {
  let queryParams = req.originalUrl.split('?')[1] ?? "";
  const removeJourneyQueryParam = `${config.JOURNEY_QUERY_PARAM}=${config.JourneyType.remove}`;

  // if query params already contains the remove journey param then remove it as sign-out-user-banner.html will re-add it
  if (queryParams.includes(removeJourneyQueryParam)) {
    // remove all occurences of journey=remove
    queryParams = queryParams.split(removeJourneyQueryParam).join('');
    // replace any && that have been left after the removal with &
    if (queryParams.includes('&&')) {
      queryParams = queryParams.replace(/&&/g, "&");
    }
    // remove any left over '&' at start or end of string
    if (queryParams.startsWith('&')) {
      queryParams = queryParams.substring(1);
    }
    if (queryParams.endsWith('&')) {
      queryParams = queryParams.slice(0, -1);
    }
  }
  return queryParams;
};
