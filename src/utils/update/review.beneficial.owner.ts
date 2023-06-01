import { BeneficialOwnerOtherKey } from "../../model/beneficial.owner.other.model";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import {
  REVIEW_OWNER_INDEX_PARAM,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE,
} from "../../config";
import { ApplicationData } from "../../model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { Update } from "model/update.type.model";

const AllBoTypes = {
  boiReview: "review_beneficial_owners_individual",
  booReview: "review_beneficial_owners_corporate",
  boGovReview: "review_beneficial_owners_government_or_public_authority",
  boIndividual: BeneficialOwnerIndividualKey,
  boOther: BeneficialOwnerOtherKey,
  boGov: BeneficialOwnerGovKey
};

const beneficialOwnerIndividualReviewRedirectUrl = `${UPDATE_AN_OVERSEAS_ENTITY_URL
        + UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE
        + REVIEW_OWNER_INDEX_PARAM}`;

const beneficialOwnerOtherReviewRedirectUrl = `${UPDATE_AN_OVERSEAS_ENTITY_URL
        + UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_PAGE
        + REVIEW_OWNER_INDEX_PARAM}`;

const beneficialOwnerGovReviewRedirectUrl = `${UPDATE_AN_OVERSEAS_ENTITY_URL
        + UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE
        + REVIEW_OWNER_INDEX_PARAM}`;

// these checks are to determine whether the BO has been fully submitted
// by checking for appData submitted with form and not present after PSC fetch
const checkBoIndividualValidation = (boi: BeneficialOwnerIndividual): boolean => {
  return boi?.usual_residential_address ? true : false;
};

const checkBoValidation = (bo: BeneficialOwnerGov): boolean => {
  const principalAddress = bo.principal_address || {};
  return Object.keys(principalAddress).length ? true : false;
};

const checkForBackButtonBo = (appData: ApplicationData, boType: string, boRedirectUrl: string) => {
  const boLength: number = appData[boType]?.length || 0;
  const boIndex = boLength - 1;
  const isAppDataAndBoLength = appData[boType] && boLength >= 1;

  if (isAppDataAndBoLength && (boType === AllBoTypes.boIndividual) && (!checkBoIndividualValidation(appData[boType][boIndex]))
        ||
        isAppDataAndBoLength && (boType === AllBoTypes.boOther || boType === AllBoTypes.boGov) && (!checkBoValidation(appData[boType][boIndex]))
  ) {
    return `${boRedirectUrl}${boIndex}`;
  }
};

export const checkAndReviewBeneficialOwner = (appData: ApplicationData): string => {
  let redirectUrl = "";
  const update_review = appData.update as Update;

  if (AllBoTypes.boiReview in update_review){
    const boiFromBackButton = checkForBackButtonBo(appData, AllBoTypes.boIndividual, beneficialOwnerIndividualReviewRedirectUrl);
    if (boiFromBackButton) {
      redirectUrl = boiFromBackButton;
      return redirectUrl;
    }

    if (appData.update?.review_beneficial_owners_individual?.length){
      redirectUrl = reviewAllOwnwers(appData, AllBoTypes.boiReview, AllBoTypes.boIndividual, beneficialOwnerIndividualReviewRedirectUrl) as string;
      return redirectUrl;
    }
  }

  if (AllBoTypes.booReview in update_review){
    const booFromBackButton = checkForBackButtonBo(appData, AllBoTypes.boOther, beneficialOwnerOtherReviewRedirectUrl);
    if (booFromBackButton) {
      redirectUrl = booFromBackButton;
      return redirectUrl;
    }

    if (appData.update?.review_beneficial_owners_corporate?.length){
      redirectUrl = reviewAllOwnwers(appData, AllBoTypes.booReview, AllBoTypes.boOther, beneficialOwnerOtherReviewRedirectUrl) as string;
      return redirectUrl;
    }
  }

  if (AllBoTypes.boGovReview in update_review){
    const bogFromBackButton = checkForBackButtonBo(appData, AllBoTypes.boGov, beneficialOwnerGovReviewRedirectUrl);
    if (bogFromBackButton) {
      redirectUrl = bogFromBackButton;
      return redirectUrl;
    }

    if (appData.update?.review_beneficial_owners_government_or_public_authority?.length){
      redirectUrl = reviewAllOwnwers(appData, AllBoTypes.boGovReview, AllBoTypes.boGov, beneficialOwnerGovReviewRedirectUrl) as string;
      return redirectUrl;
    }
  }
  return redirectUrl;
};

export const reviewAllOwnwers = (appData: ApplicationData, ownerReviewType: string, ownerType: string, ownerRedirectUrl: string) => {
  let redirectUrl = "";
  const ownerLength: number = appData[ownerType]?.length || 0;

  if (ownerLength >= 0){
    const boOrmo = appData?.update?.[ownerReviewType]?.pop() as typeof ownerType;
    if (!boOrmo){
      return redirectUrl;
    }

    let index = 0;
    if (!appData[ownerType]) {
      appData[ownerType] = [boOrmo];
    } else {
      index = appData[ownerType].push(boOrmo) - 1;
    }
    redirectUrl = `${ownerRedirectUrl}${index}`;
    return redirectUrl;
  }
};
