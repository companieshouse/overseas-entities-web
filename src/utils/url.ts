import * as config from "../config";
import { Request } from "express";
import { ApplicationData } from "../model";
import { getApplicationData } from "./application.data";
import { Session } from "@companieshouse/node-session-handler";
import { IsRemoveKey } from "../model/data.types.model";
import { createAndLogErrorRequest, logger } from "./logger";

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

  // if there are multiple journey query params in the url, the values will be comma separated eg remove,remove if there are 2 journey=remove in the url
  // split(",") will convert to an array, if there is only 1 value it will be array of 1, if no journey param it will be an array containing an empty string.
  // Then we can check if array contains 'remove'
  const journeyQueryParam: string = req.query[config.JOURNEY_QUERY_PARAM]?.toString() ?? "";
  const journeyQueryParamsArray: string[] = journeyQueryParam.split(",");

  if (journeyQueryParamsArray?.length > 1) {
    throw createAndLogErrorRequest(req, "More than one journey query parameter found in url " + encodeURI(req.originalUrl));
  }
  return journeyQueryParamsArray.includes(config.JourneyType.remove);
};

export function getPreviousPageUrl(req: Request, basePath: string) {
  const headers = req.rawHeaders;
  const absolutePreviousPageUrl = headers.filter(item => item.includes(basePath))[0];
  // Don't attempt to determine a relative previous page URL if no absolute URL is found
  if (!absolutePreviousPageUrl) {
    return absolutePreviousPageUrl;
  }

  const startingIndexOfRelativePath = absolutePreviousPageUrl.indexOf(basePath);
  const relativePreviousPageUrl = absolutePreviousPageUrl.substring(startingIndexOfRelativePath);

  logger.debugRequest(req, `Relative previous page URL is ${relativePreviousPageUrl}`);

  return relativePreviousPageUrl;
}

export const isUpdateOrRemoveJourney = (req: Request): boolean => {
  const appData: ApplicationData = getApplicationData(req.session);
  return !!appData.entity_number; // !! = truthy check
};