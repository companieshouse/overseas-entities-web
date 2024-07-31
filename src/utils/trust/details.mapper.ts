import { ApplicationData } from '../../model';
import { Trust, TrustBeneficialOwner, TrustKey } from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { BeneficialOwnerIndividualKey } from '../../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../../model/beneficial.owner.other.model';
import { addTrustToBeneficialOwner, getTrustByIdFromApp, removeTrustFromBeneficialOwner } from '../../utils/trusts';
import { getReviewTrustById } from '../../utils/update/review_trusts';

//  to page form mapping
const mapDetailToPage = (
  appData: ApplicationData,
  trustId: string,
  isReview: boolean
): Page.TrustDetailsForm => {
  let trustData;
  if (isReview) {
    trustData = getReviewTrustById(appData, trustId);
  } else {
    trustData = getTrustByIdFromApp(appData, trustId);
  }

  let stillInvolvedInOverseasEntity: string;
  switch (trustData.trust_still_involved_in_overseas_entity) {
      case "Yes":
        stillInvolvedInOverseasEntity = "1";
        break;
      case "No":
        stillInvolvedInOverseasEntity = "0";
        break;
      default:
        stillInvolvedInOverseasEntity = ""; // forces user to enter a value on new trust
        break;
  }

  const trustBoIds: string[] =
    [
      ...appData[BeneficialOwnerIndividualKey] ?? [],
      ...appData[BeneficialOwnerOtherKey] ?? [],
    ]
      .filter((bo: TrustBeneficialOwner) => bo.trust_ids?.includes(trustId))
      .map(bo => bo.id || "");

  let unableToObtainAllTrustInfo: string;
  switch (trustData.unable_to_obtain_all_trust_info) {
      case "Yes":
        unableToObtainAllTrustInfo = "0";
        break;
      case "No":
        unableToObtainAllTrustInfo = "1";
        break;
      default:
        unableToObtainAllTrustInfo = ""; // forces user to enter a value on new trust
        break;
  }

  return {
    trustId: trustData.trust_id,
    name: trustData.trust_name,
    createdDateDay: trustData.creation_date_day,
    createdDateMonth: trustData.creation_date_month,
    createdDateYear: trustData.creation_date_year,
    ceasedDateDay: trustData.ceased_date_day,
    ceasedDateMonth: trustData.ceased_date_month,
    ceasedDateYear: trustData.ceased_date_year,
    hasAllInfo: unableToObtainAllTrustInfo,
    beneficialOwnersIds: trustBoIds,
    stillInvolved: stillInvolvedInOverseasEntity,
    relevant_period: trustData.relevant_period,
  };
};

const mapDetailToSession = (
  formData: Page.TrustDetailsForm,
  hasNoBoAssignableToTrust: boolean
): Trust => {
  let stillInvolved = (formData.stillInvolved === "1") ? "Yes" : "No";

  // If a boolean value isn't receieved from the web form (it could be null or undefined, e.g. if question not displayed), need to set null
  if (formData.stillInvolved === null || formData.stillInvolved === undefined) {
    stillInvolved = null as unknown as string;
  }

  const isTrustToBeCeased = hasNoBoAssignableToTrust || stillInvolved === "No";

  return {
    trust_id: formData.trustId,
    trust_name: formData.name,
    creation_date_day: formData.createdDateDay,
    creation_date_month: formData.createdDateMonth,
    creation_date_year: formData.createdDateYear,
    ceased_date_day: isTrustToBeCeased ? formData.ceasedDateDay : undefined,
    ceased_date_month: isTrustToBeCeased ? formData.ceasedDateMonth : undefined,
    ceased_date_year: isTrustToBeCeased ? formData.ceasedDateYear : undefined,
    trust_still_involved_in_overseas_entity: stillInvolved,
    unable_to_obtain_all_trust_info: (formData.hasAllInfo === "0") ? "Yes" : "No",
    relevant_period: formData.relevant_period,
  };
};

const mapBeneficialOwnerToSession = (
  beneficialOwners: TrustBeneficialOwner[] | undefined,
  forIds: string[],
  trustId: string,
): TrustBeneficialOwner[] => {
  return (beneficialOwners ?? []).map((bo: TrustBeneficialOwner) => {
    bo = removeTrustFromBeneficialOwner(bo, trustId);

    if (!forIds.includes(bo.id)) {
      return bo;
    }

    return addTrustToBeneficialOwner(bo, trustId);
  });
};

//  other
const generateTrustId = (appData: ApplicationData): string => {
  return String((appData[TrustKey] ?? []).length + 1);
};

export {
  mapDetailToPage,
  mapDetailToSession,
  mapBeneficialOwnerToSession,
  generateTrustId,
};
