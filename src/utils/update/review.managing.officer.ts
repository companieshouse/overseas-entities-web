import { mapDataObjectToFields } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { ManagingOfficerKey } from "../../model/managing.officer.model";
import { Update } from "../../model/update.type.model";
import { reviewAllOwnwers } from "./review.beneficial.owner";
import { AddressKeys } from "../../model/data.types.model";
import { getRedirectUrl } from "../url";

import {
  REVIEW_OWNER_INDEX_PARAM,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL,
  UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE,
  UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE,
} from "../../config";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  UsualResidentialAddressKey,
  UsualResidentialAddressKeys,
} from "../../model/address.model";

const AllMoTypes = {
  moIndividual: ManagingOfficerKey,
  moCorporate: ManagingOfficerCorporateKey,
  moIndividualOfficerReview: "review_managing_officers_individual",
  moCorporateOfficerReview: "review_managing_officers_corporate",
};

let managingOfficerIndividualReviewRedirectUrl = "";
let managingOfficerCorporateReviewRedirectUrl = "";

const checkMoResignedOnSubmitted = (managingOfficer): boolean => {
  return managingOfficer?.resigned_on ? true : false;
};

const setManagingOfficerReviewRedirectUrls = (req: any) => {
  const baseUrl = getRedirectUrl({
    req,
    urlWithEntityIds: UPDATE_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL,
    urlWithoutEntityIds: UPDATE_AN_OVERSEAS_ENTITY_URL,
  });
  managingOfficerIndividualReviewRedirectUrl = `${baseUrl + UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE + REVIEW_OWNER_INDEX_PARAM}`;
  managingOfficerCorporateReviewRedirectUrl = `${baseUrl + UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE + REVIEW_OWNER_INDEX_PARAM}`;
};

const checkForUnsubmittedReviewMo = (appData: ApplicationData, moType: string, moRedirectUrl: string) => {
  const moLength: number = appData[moType]?.length || 0;
  const moIndex = moLength - 1;
  const moInAppData = appData[moType] && moLength >= 1;
  if (moInAppData && (!checkMoResignedOnSubmitted(appData[moType][moIndex]))) {
    return `${moRedirectUrl}${moIndex}`;
  }
};

export const checkAndReviewManagingOfficers = (req: Request, appData: ApplicationData): string => {

  let redirectUrl = "";
  setManagingOfficerReviewRedirectUrls(req);
  const update_review = appData.update as Update;

  if (AllMoTypes.moIndividualOfficerReview in update_review) {
    const redirectToUnsubmittedMo = checkForUnsubmittedReviewMo(appData, AllMoTypes.moIndividual, managingOfficerIndividualReviewRedirectUrl);
    if (redirectToUnsubmittedMo) {
      return redirectToUnsubmittedMo;
    }
    if (appData.update?.review_managing_officers_individual?.length) {
      redirectUrl = reviewAllOwnwers(appData, AllMoTypes.moIndividualOfficerReview, AllMoTypes.moIndividual, managingOfficerIndividualReviewRedirectUrl) as string;
      return redirectUrl;
    }
  }

  if (AllMoTypes.moCorporateOfficerReview in update_review) {
    const redirectToUnsubmittedMo = checkForUnsubmittedReviewMo(appData, AllMoTypes.moCorporate, managingOfficerCorporateReviewRedirectUrl);
    if (redirectToUnsubmittedMo) {
      return redirectToUnsubmittedMo;
    }
    if (appData.update?.review_managing_officers_corporate?.length) {
      redirectUrl = reviewAllOwnwers(appData, AllMoTypes.moCorporateOfficerReview, AllMoTypes.moCorporate, managingOfficerCorporateReviewRedirectUrl) as string;
      return redirectUrl;
    }
  }

  return "";

};

export function fetchIndividualMOAddress(appData: any, index: number) {
  let dataToReview = {}, residentialAddress = {}, serviceAddress = {};
  if (appData?.managing_officers_individual) {
    dataToReview = appData?.managing_officers_individual[Number(index)];
    if (dataToReview) {
      residentialAddress = mapDataObjectToFields(dataToReview[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys);
      serviceAddress = mapDataObjectToFields(dataToReview[ServiceAddressKey], ServiceAddressKeys, AddressKeys);
    }
  }
  return { dataToReview, residentialAddress, serviceAddress };
}
