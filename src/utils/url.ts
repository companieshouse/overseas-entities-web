import * as config from "../config";
import { Request } from "express";
import { ApplicationData } from "../model";
import { getApplicationData } from "./application.data";
import { Session } from "@companieshouse/node-session-handler";
import { IsRemoveKey } from "../model/data.types.model";
import { createAndLogErrorRequest, logger } from "./logger";
import { isActiveFeature } from "./feature.flag";

interface BackLinkUrlDependencies {
 req: Request;
 urlWithEntityIds: string;
 urlWithoutEntityIds: string;
}
export interface TransactionIdAndSubmissionId {
  transactionId: string;
  submissionId: string;
}

export const getBackLinkUrl = ({
  req,
  urlWithEntityIds,
  urlWithoutEntityIds,
}: BackLinkUrlDependencies): string => {
  try {
    const ids = getTransactionIdAndSubmissionIdFromOriginalUrl(req);

    if (
      !isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) ||
      typeof ids === "undefined"
    ) {
      return urlWithoutEntityIds;
    }
    return getUrlWithTransactionIdAndSubmissionId(
      urlWithEntityIds,
      ids[config.ROUTE_PARAM_TRANSACTION_ID],
      ids[config.ROUTE_PARAM_SUBMISSION_ID]
    );
  } catch (error) {
    logger.errorRequest(req, error);
    return urlWithoutEntityIds;
  }
};

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

/**
 * This is required to extract the transactionId and submissionId prior to the request reaching its intended mount path
 */
export const getTransactionIdAndSubmissionIdFromOriginalUrl = (req: Request): TransactionIdAndSubmissionId | undefined => {

  try {

    logger.infoRequest(req, `extracting transactionId and submissionId from the req.originalUrl: ${req.originalUrl}`);

    if (!req.originalUrl.includes(config.TRANSACTION_ID_URL_KEY) || !req.originalUrl.includes(config.SUBMISSION_ID_URL_KEY)) {
      return;
    }

    const elements = req.originalUrl.replace(/\/{2,}/g, "/").split("/");
    const transactionIndex = elements.indexOf("transaction") + 1;
    const submissionIndex = elements.indexOf("submission") + 1;

    if (!elements[transactionIndex] || !elements[submissionIndex] || Math.abs(transactionIndex - submissionIndex) < 2) {
      return;
    }

    return {
      transactionId: elements[transactionIndex],
      submissionId: elements[submissionIndex],
    };

  } catch (e) {
    logger.errorRequest(req, `error extracting transactionId and submissionId from req.originalUrl: ${req.originalUrl} with error object: ${e}`);
  }
};

export const isRegistrationJourney = (req: Request): boolean => {
  if (req.originalUrl.startsWith(config.LANDING_URL)) {
    return true;
  }
  return false;
};

export const isUpdateJourney = async (req: Request): Promise<boolean> => {
  if (req.originalUrl.startsWith(config.UPDATE_LANDING_URL) && !(await isRemoveJourney(req))) {
    return true;
  }
  return false;
};

export const isRemoveJourney = async (req: Request): Promise<boolean> => {
  const session = req.session as Session;
  const appData: ApplicationData = await getApplicationData(session);

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
