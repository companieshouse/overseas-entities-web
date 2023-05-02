import { BeneficialOwnerGov } from "model/beneficial.owner.gov.model";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";

const checkBoIndividualValidation = (boi: BeneficialOwnerIndividual | BeneficialOwnerGov) => {
  if (boi?.service_address){
    return true;
  } else {
    return false;
  }
};

export const checkAndReviewBeneficialOwner = (appData: ApplicationData): string => {
  let redirectUrl = "";
  if (appData.update?.review_beneficial_owners_individual?.length !== 0){
    const beneficialOwnerReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
      + config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE
      + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;
    redirectUrl = reviewAllBeneficialOwnwer(appData, "review_beneficial_owners_individual", "beneficial_owners_individual", beneficialOwnerReviewRedirectUrl);
  } else if (appData.update?.review_beneficial_owners_government_or_public_authority?.length !== 0){
    const beneficialOwnerGovReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
      + config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE
      + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;
    redirectUrl = reviewAllBeneficialOwnwer(appData, "review_beneficial_owners_government_or_public_authority", "beneficial_owners_government_or_public_authority", beneficialOwnerGovReviewRedirectUrl);
  }
  return redirectUrl;
};

const reviewAllBeneficialOwnwer = (appData: ApplicationData, boReviewType: string, boType: string, beneficialOwnerReviewRedirectUrl: string) => {
  let redirectUrl = "";
  const boiLength: number = appData[boType]?.length || 0;
  const boiIndex = boiLength - 1;
  if ((appData[boType] && boiLength >= 1) && !checkBoIndividualValidation(appData[boType][boiIndex])) {
    redirectUrl = `${beneficialOwnerReviewRedirectUrl}${boiIndex}`;
    return redirectUrl;
  }

  if (boiLength >= 0 && appData.update){
    const boi = appData?.update[boReviewType]?.pop() as typeof boType;
    if (!boi){
      return redirectUrl;
    }

    let index = 0;

    if (!appData[boType]) {
      appData[boType] = [boi];
    } else {
      index = appData[boType].push(boi) - 1;
    }
    redirectUrl = `${beneficialOwnerReviewRedirectUrl}${index}`;
    return redirectUrl;
  }
  return redirectUrl;
};
