import * as config from "../../config";
import { ApplicationData } from "../../model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { BeneficialOwnerGov } from "../../model/beneficial.owner.gov.model";

const checkBoIndividualValidation = (boi: BeneficialOwnerIndividual) => {
  if (boi?.usual_residential_address){
    return true;
  } else {
    return false;
  }
};

const checkBoGovValidation = (boGov: BeneficialOwnerGov) => {
  if (boGov.principal_address){
    return true;
  } else {
    return false;
  }
};

export const checkAndReviewBeneficialOwner = (appData: ApplicationData) => {
  let redirectUrl = "";
  if (appData.update?.review_beneficial_owners_individual?.length !== 0){
    const beneficialOwnerReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
      + config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE
      + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;

    const boiLength: number = appData.beneficial_owners_individual?.length || 0;
    const boiIndex = boiLength - 1;
    if ((appData.beneficial_owners_individual && boiLength >= 1) && !checkBoIndividualValidation(appData.beneficial_owners_individual[boiIndex])) {
      redirectUrl = `${beneficialOwnerReviewRedirectUrl}${boiIndex}`;
      return redirectUrl;
    }

    if (boiLength >= 0){
      const boi = appData.update?.review_beneficial_owners_individual?.pop() as BeneficialOwnerIndividual;
      if (!boi){
        return redirectUrl;
      }

      let index = 0;

      if (!appData.beneficial_owners_individual) {
        appData.beneficial_owners_individual = [boi];
      } else {
        index = appData.beneficial_owners_individual.push(boi) - 1;
      }
      redirectUrl = `${beneficialOwnerReviewRedirectUrl}${index}`;
      return redirectUrl;
    }
    return redirectUrl;
  } else if (appData.update.review_beneficial_owners_government_or_public_authority?.length !== 0){
    const beneficialOwnerReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
      + config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE
      + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;
    const boiLength: number = appData.beneficial_owners_individual?.length || 0;
    const boiIndex = boiLength - 1;
    if ((appData.beneficial_owners_government_or_public_authority && boiLength >= 1) && !checkBoGovValidation(appData.beneficial_owners_government_or_public_authority[boiIndex])) {
      redirectUrl = `${beneficialOwnerReviewRedirectUrl}${boiIndex}`;
      return redirectUrl;
    }

    if (boiLength >= 0){
      const boi = appData.update?.review_beneficial_owners_government_or_public_authority?.pop() as BeneficialOwnerGov;
      if (!boi){
        return redirectUrl;
      }

      let index = 0;

      if (!appData.beneficial_owners_government_or_public_authority) {
        appData.beneficial_owners_government_or_public_authority = [boi];
      } else {
        index = appData.beneficial_owners_government_or_public_authority.push(boi) - 1;
      }
      redirectUrl = `${beneficialOwnerReviewRedirectUrl}${index}`;
      return redirectUrl;
    }
    return redirectUrl;
  }
};
