import * as config from "../../config";
import { ApplicationData } from "../../model";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
// import { BeneficialOwnerGov } from "../../model/beneficial.owner.gov.model";

const checkBoIndividualValidation = (boi: BeneficialOwnerIndividual) => {
  if (boi?.usual_residential_address){
    return true;
  } else {
    return false;
  }
};

// const checkBoGovValidation = (boGov: BeneficialOwnerGov) => {
//   if (boGov.principal_address){
//     return true;
//   } else {
//     return false;
//   }
// };

export const checkAndReviewBeneficialOwner = (appData: ApplicationData): string => {
  let redirectUrl = "";
  console.log(`app data length is ${appData.update?.review_beneficial_owners_individual?.length}`);
  if (appData.update?.review_beneficial_owners_individual?.length !== 0){
    const beneficialOwnerReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
      + config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE
      + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;
    console.log(`app data in if is ${JSON.stringify(appData)}`);
    redirectUrl = functionone(appData, "review_beneficial_owners_individual", "beneficial_owners_individual", beneficialOwnerReviewRedirectUrl);
  } else if (appData.update?.review_beneficial_owners_government_or_public_authority?.length !== 0){
    const beneficialOwnerGovReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
      + config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE
      + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;
    redirectUrl = functionone(appData, "review_beneficial_owners_government_or_public_authority", appData.beneficial_owners_government_or_public_authority, beneficialOwnerGovReviewRedirectUrl);
  }
  return redirectUrl;
};

const functionone = (appData: ApplicationData, boReviewType: string, boType, beneficialOwnerReviewRedirectUrl: string) => {
  let redirectUrl = "";
  console.log(`appdata value is ${JSON.stringify(appData)}`);
  console.log(`boilength is ${appData[boType]?.length}`);
  const boiLength: number = appData[boType]?.length || 0;
  const boiIndex = boiLength - 1;
  console.log(`review bo type ${JSON.stringify(appData[boType])}`);
  if ((appData[boType] && boiLength >= 1) && !checkBoIndividualValidation(appData[boType][boiIndex])) {
    redirectUrl = `${beneficialOwnerReviewRedirectUrl}${boiIndex}`;
    return redirectUrl;
  }

  if (boiLength >= 0 && appData.update){
    const boi = appData?.update[boReviewType]?.pop() as typeof boType;
    console.log(`bo poped is ${JSON.stringify(boi)}`);
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

// export const checkAndReviewBeneficialOwner = (appData: ApplicationData) => {
//   let redirectUrl = "";
//   if (appData.update?.review_beneficial_owners_individual?.length !== 0){
//     const beneficialOwnerReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
//       + config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE
//       + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;

//     const boiLength: number = appData.beneficial_owners_individual?.length || 0;
//     const boiIndex = boiLength - 1;
//     if ((appData.beneficial_owners_individual && boiLength >= 1) && !checkBoIndividualValidation(appData.beneficial_owners_individual[boiIndex])) {
//       redirectUrl = `${beneficialOwnerReviewRedirectUrl}${boiIndex}`;
//       return redirectUrl;
//     }

//     if (boiLength >= 0){
//       const boi = appData.update?.review_beneficial_owners_individual?.pop() as BeneficialOwnerIndividual;
//       if (!boi){
//         return redirectUrl;
//       }

//       let index = 0;

//       if (!appData.beneficial_owners_individual) {
//         appData.beneficial_owners_individual = [boi];
//       } else {
//         index = appData.beneficial_owners_individual.push(boi) - 1;
//       }
//       redirectUrl = `${beneficialOwnerReviewRedirectUrl}${index}`;
//       return redirectUrl;
//     }
//     return redirectUrl;
//   } else if (appData.update.review_beneficial_owners_government_or_public_authority?.length !== 0){
//     const beneficialOwnerReviewRedirectUrl = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL
//       + config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE
//       + config.REVIEW_BENEFICIAL_OWNER_INDEX_PARAM}`;
//     const bogLength: number = appData.beneficial_owners_individual?.length || 0;
//     const bogIndex = bogLength - 1;
//     if ((appData.beneficial_owners_government_or_public_authority && bogLength >= 1) && !checkBoGovValidation(appData.beneficial_owners_government_or_public_authority[bogIndex])) {
//       redirectUrl = `${beneficialOwnerReviewRedirectUrl}${bogIndex}`;
//       return redirectUrl;
//     }

//     if (bogLength >= 0){
//       const boGov = appData.update?.review_beneficial_owners_government_or_public_authority?.pop() as BeneficialOwnerGov;
//       if (!boGov){
//         return redirectUrl;
//       }

//       let index = 0;

//       if (!appData.beneficial_owners_government_or_public_authority) {
//         appData.beneficial_owners_government_or_public_authority = [boGov];
//       } else {
//         index = appData.beneficial_owners_government_or_public_authority.push(boGov) - 1;
//       }
//       redirectUrl = `${beneficialOwnerReviewRedirectUrl}${index}`;
//       return redirectUrl;
//     }
//     return redirectUrl;
//   }
// };
