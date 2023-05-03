import { BeneficialOwnerGov } from "../../model/beneficial.owner.gov.model";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";

const AllBoTypes = {
  boiReview: "review_beneficial_owners_individual",
  boGovReview: "review_beneficial_owners_government_or_public_authority",
  boIndividual: "beneficial_owners_individual",
  boGov: "beneficial_owners_government_or_public_authority"
};

const beneficialOwnerReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
      + config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE
      + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;

const beneficialOwnerGovReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
        + config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE
        + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;

const checkBoIndividualValidation = (boi: BeneficialOwnerIndividual): boolean => {
  return boi?.usual_residential_address ? true : false;
};

const checkBoGovValidation = (boi: BeneficialOwnerGov): boolean => {
  return boi?.principal_address ? true : false;
};

const checkForBackButtonBo = (appData: ApplicationData, boType: string, boRedirectUrl: string) => {
  const boLength: number = appData[boType]?.length || 0;
  const boIndex = boLength - 1;

  if ((appData[boType] === AllBoTypes.boIndividual && boLength >= 1) && !checkBoIndividualValidation(appData[boType][boIndex])) {
    return `${boRedirectUrl}${boIndex}`;
  } else if ((appData[boType] === AllBoTypes.boGov && boLength >= 1) && !checkBoGovValidation(appData[boType][boIndex])) {
    return `${boRedirectUrl}${boIndex}`;
  }
};

export const checkAndReviewBeneficialOwner = (appData: ApplicationData): string => {
  let redirectUrl = "";

  for (const updateAppData in appData.update){

    switch (updateAppData){
        case AllBoTypes.boiReview: {
          const boiFromBackButton = checkForBackButtonBo(appData, AllBoTypes.boIndividual, beneficialOwnerReviewRedirectUrl);
          if (boiFromBackButton) {
            redirectUrl = boiFromBackButton;
            return redirectUrl;
          }

          if (appData.update?.review_beneficial_owners_individual?.length){
            redirectUrl = reviewAllBeneficialOwnwer(appData, AllBoTypes.boiReview, AllBoTypes.boIndividual, beneficialOwnerReviewRedirectUrl);
            return redirectUrl;
          }
          break;
        }
        case AllBoTypes.boGovReview: {
          const bogFromBackButton = checkForBackButtonBo(appData, AllBoTypes.boGovReview, beneficialOwnerGovReviewRedirectUrl);
          if (bogFromBackButton) {
            redirectUrl = bogFromBackButton;
            return redirectUrl;
          }

          if (appData.update?.review_beneficial_owners_government_or_public_authority?.length){
            redirectUrl = reviewAllBeneficialOwnwer(appData, AllBoTypes.boGovReview, AllBoTypes.boGov, beneficialOwnerGovReviewRedirectUrl);
            return redirectUrl;
          }
          break;
        }
    }
  }
  return redirectUrl;
};

const reviewAllBeneficialOwnwer = (appData: ApplicationData, boReviewType: string, boType: string, beneficialOwnerReviewRedirectUrl: string) => {
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
    redirectUrl = `${beneficialOwnerReviewRedirectUrl}${index}`;
    return redirectUrl;
  }
  return redirectUrl;
};
