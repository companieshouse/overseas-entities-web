import { REVIEW_OWNER_INDEX_PARAM, UPDATE_AN_OVERSEAS_ENTITY_URL, UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE, UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE } from "../../config";
import { ApplicationData } from "../../model";
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from "../../model/managing.officer.corporate.model";
import { ManagingOfficerIndividual, ManagingOfficerKey } from "../../model/managing.officer.model";
import { Update } from "../../model/update.type.model";
import { reviewAllOwnwers } from "./review.beneficial.owner";

const AllMoTypes = {
  moIndividualOfficerReview: "review_managing_officers_individual",
  moCorporateOfficerReview: "review_managing_officers_corporate",
  moIndividual: ManagingOfficerKey,
  moCorporate: ManagingOfficerCorporateKey
};

const managingOfficerIndividualReviewRedirectUrl = `${UPDATE_AN_OVERSEAS_ENTITY_URL
  + UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE
  + REVIEW_OWNER_INDEX_PARAM}`;

const managingOfficerCorporateReviewRedirectUrl = `${UPDATE_AN_OVERSEAS_ENTITY_URL
  + UPDATE_REVIEW_MANAGING_OFFICER_CORPORATE_PAGE
  + REVIEW_OWNER_INDEX_PARAM}`;

const checkmoIndividualValidation = (moIndividual: ManagingOfficerIndividual): boolean => {
  return moIndividual?.usual_residential_address ? true : false;
};

const checkMoCorporateValidation = (moCorporate: ManagingOfficerCorporate): boolean => {
  const principalAddress = moCorporate.principal_address || {};
  return Object.keys(principalAddress).length ? true : false;
};

const checkForBackButtonMo = (appData: ApplicationData, moType: string, moRedirectUrl: string) => {
  const moLength: number = appData[moType]?.length || 0;
  const moIndex = moLength - 1;
  const isAppDataAndMoLength = appData[moType] && moLength >= 1;

  if (isAppDataAndMoLength &&
      (
        (moType === AllMoTypes.moIndividual) && (!checkmoIndividualValidation(appData[moType][moIndex]))
      ||
        (moType === AllMoTypes.moCorporate) && (!checkMoCorporateValidation(appData[moType][moIndex]))
      )
  ) {
    return `${moRedirectUrl}${moIndex}`;
  }
};

export const checkAndReviewManagingOfficers = (appData: ApplicationData): string => {
  let redirectUrl = "";

  const update_review = appData.update as Update;
  if (AllMoTypes.moIndividualOfficerReview in update_review){
    const moiFromBackButton = checkForBackButtonMo(appData, AllMoTypes.moIndividual, managingOfficerIndividualReviewRedirectUrl);
    if (moiFromBackButton) {
      redirectUrl = moiFromBackButton;
      return redirectUrl;
    }

    if (appData.update?.review_managing_officers_individual?.length){
      redirectUrl = reviewAllOwnwers(appData, AllMoTypes.moIndividualOfficerReview, AllMoTypes.moIndividual, managingOfficerIndividualReviewRedirectUrl) as string;
      return redirectUrl;
    }
  }

  if (AllMoTypes.moCorporateOfficerReview in update_review){
    const mocFromBackButton = checkForBackButtonMo(appData, AllMoTypes.moCorporate, managingOfficerCorporateReviewRedirectUrl);
    if (mocFromBackButton) {
      redirectUrl = mocFromBackButton;
      return redirectUrl;
    }

    if (appData.update?.review_managing_officers_corporate?.length){
      redirectUrl = reviewAllOwnwers(appData, AllMoTypes.moCorporateOfficerReview, AllMoTypes.moCorporate, managingOfficerCorporateReviewRedirectUrl) as string;
      return redirectUrl;
    }
  }
  return "";
};
