import { ApplicationData } from '../../model';
import { Trust, TrustBeneficialOwner, TrustKey } from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { BeneficialOwnerIndividualKey } from '../../model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../../model/beneficial.owner.other.model';
import { addTrustToBeneficialOwner, getTrustByIdFromApp, removeTrustFromBeneficialOwner } from '../../utils/trusts';

//  to page form mapping
const mapDetailToPage = (
  appData: ApplicationData,
  trustId: string,
): Page.TrustDetailsForm => {
  const trustData = getTrustByIdFromApp(appData, trustId);

  const trustBoIds: string[] =
    [
      ...appData[BeneficialOwnerIndividualKey] ?? [],
      ...appData[BeneficialOwnerOtherKey] ?? [],
    ]
      .filter((bo: TrustBeneficialOwner) => bo.trust_ids?.includes(trustId))
      .map(bo => bo.id || "");

  return {
    trustId: trustData.trust_id,
    name: trustData.trust_name,
    createdDateDay: trustData.creation_date_day,
    createdDateMonth: trustData.creation_date_month,
    createdDateYear: trustData.creation_date_year,
    hasAllInfo: trustData.unable_to_obtain_all_trust_info,
    beneficialOwnersIds: trustBoIds,
  };
};

//  to session mapping
const mapDetailToSession = (
  formData: Page.TrustDetailsForm,
): Trust => {
  const data = formData;

  return {
    trust_id: data.trustId,
    trust_name: data.name,
    creation_date_day: data.createdDateDay,
    creation_date_month: data.createdDateMonth,
    creation_date_year: data.createdDateYear,
    unable_to_obtain_all_trust_info: data.hasAllInfo,
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
