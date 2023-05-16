import { REVIEW_OWNER_INDEX_PARAM, UPDATE_AN_OVERSEAS_ENTITY_URL, UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE } from "../../config";
import { ApplicationData } from "../../model";
import { ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { ManagingOfficerIndividual, ManagingOfficerKey } from "../../model/managing.officer.model";
import { Update } from "../../model/update.type.model";
import { reviewAllOwnwers } from "./review.beneficial.owner";

const AllMoTypes = {
  moIndividualOfiicerReview: "review_managing_officers_individual",
  moCorporateOfficerReview: "review_managing_officers_corporate",
  moIndividual: ManagingOfficerKey,
  moCorporate: ManagingOfficerCorporateKey
};

const managingOfficerIndividualReviewRedirectUrl = `${UPDATE_AN_OVERSEAS_ENTITY_URL
  + UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE
  + REVIEW_OWNER_INDEX_PARAM}`;

const checkmoIndividualValidation = (moIndividual: ManagingOfficerIndividual): boolean => {
  return moIndividual?.resigned_on ? true : false;
};

const checkForBackButtonBo = (appData: ApplicationData, moType: string, moRedirectUrl: string) => {
  const moLength: number = appData[moType]?.length || 0;
  const moIndex = moLength - 1;
  const isAppDataAndMoLength = appData[moType] && moLength >= 1;

  if (isAppDataAndMoLength && (moType === AllMoTypes.moIndividual) && (!checkmoIndividualValidation(appData[moType][moIndex]))) {
    return `${moRedirectUrl}${moIndex}`;
  }
};

export const checkAndReviewManagingOfficers = (appData: ApplicationData): string => {
  let redirectUrl = "";

  const update_review = appData.update as Update;
  if (AllMoTypes.moIndividualOfiicerReview in update_review){
    const moiFromBackButton = checkForBackButtonBo(appData, AllMoTypes.moIndividual, managingOfficerIndividualReviewRedirectUrl);
    if (moiFromBackButton) {
      redirectUrl = moiFromBackButton;
      return redirectUrl;
    }
  }

  if (appData.update?.review_managing_officers_individual?.length){
    redirectUrl = reviewAllOwnwers(appData, AllMoTypes.moIndividualOfiicerReview, AllMoTypes.moIndividual, managingOfficerIndividualReviewRedirectUrl) as string;
    return redirectUrl;
  }
  return "";
};
