import { BeneficialOwnerGov, BeneficialOwnerGovKey } from "../../model/beneficial.owner.gov.model";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from "../../model/beneficial.owner.individual.model";
import { Update } from "model/update.type.model";

const AllBoTypes = {
  boiReview: "review_beneficial_owners_individual",
  boGovReview: "review_beneficial_owners_government_or_public_authority",
  boIndividual: BeneficialOwnerIndividualKey,
  boGov: BeneficialOwnerGovKey
};

const beneficialOwnerIndividualReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
      + config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE
      + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;

const beneficialOwnerGovReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
        + config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE
        + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;

const checkBoIndividualValidation = (boi: BeneficialOwnerIndividual): boolean => {
  return boi?.usual_residential_address ? true : false;
};

const checkBoGovValidation = (boGov: BeneficialOwnerGov): boolean => {
  return boGov?.principal_address ? true : false;
};

const checkForBackButtonBo = (appData: ApplicationData, boType: string, boRedirectUrl: string) => {
  const boLength: number = appData[boType]?.length || 0;
  const boIndex = boLength - 1;
  const isAppDataAndBoLength = appData[boType] && boLength >= 1;

  if (isAppDataAndBoLength && (boType === AllBoTypes.boIndividual) && (!checkBoIndividualValidation(appData[boType][boIndex]))
        ||
        isAppDataAndBoLength && (boType === AllBoTypes.boGov) && (!checkBoGovValidation(appData[boType][boIndex]))
  ) {
    return `${boRedirectUrl}${boIndex}`;
  }
};

export const checkAndReviewBeneficialOwner = (appData: ApplicationData): string => {
  let redirectUrl = "";
  const update_review = appData.update as Update;

  console.log(`update review is ${AllBoTypes.boiReview in update_review}`);
  console.log(`app data is ${JSON.stringify(appData)}`);
  if (AllBoTypes.boiReview in update_review){
    const boiFromBackButton = checkForBackButtonBo(appData, AllBoTypes.boIndividual, beneficialOwnerIndividualReviewRedirectUrl);
    if (boiFromBackButton) {
      redirectUrl = boiFromBackButton;
      return redirectUrl;
    }

    if (appData.update?.review_beneficial_owners_individual?.length){
      redirectUrl = reviewAllBeneficialOwnwer(appData, AllBoTypes.boiReview, AllBoTypes.boIndividual, beneficialOwnerIndividualReviewRedirectUrl) as string;
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
      redirectUrl = reviewAllBeneficialOwnwer(appData, AllBoTypes.boGovReview, AllBoTypes.boGov, beneficialOwnerGovReviewRedirectUrl) as string;
      return redirectUrl;
    }
  }
  return redirectUrl;
};

const reviewAllBeneficialOwnwer = (appData: ApplicationData, boReviewType: string, boType: string, beneficialOwnerRedirectUrl: string) => {
  let redirectUrl = "";
  const boLength: number = appData[boType]?.length || 0;

  if (boLength >= 0){
    const bo = appData?.update?.[boReviewType]?.pop() as typeof boType;
    if (!bo){
      return redirectUrl;
    }

    let index = 0;
    if (!appData[boType]) {
      appData[boType] = [bo];
    } else {
      index = appData[boType].push(bo) - 1;
    }
    redirectUrl = `${beneficialOwnerRedirectUrl}${index}`;
    return redirectUrl;
  }
};
