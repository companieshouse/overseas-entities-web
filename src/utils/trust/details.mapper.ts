import { ApplicationData } from '../../model';
import { Trust, TrustBeneficialOwner, TrustKey } from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from '../../model/beneficial.owner.individual.model';
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from '../../model/beneficial.owner.other.model';
import { addTrustToBeneficialOwner, removeTrustFromBeneficialOwner } from '../../utils/trusts';
import { BeneficialOwnerTypeChoice } from '../../model/beneficial.owner.type.model';

//  to page form mapping
const mapDetailToPage = (
  appData: ApplicationData,
  trustId: string,
): Page.TrustDetails => {
  const trustData = appData[TrustKey]?.find(trust => trust.trust_id === trustId) ?? {} as Trust;

  const trustBoIds: string[] =
    [
      ...appData[BeneficialOwnerIndividualKey] ?? [],
      ...appData[BeneficialOwnerOtherKey] ?? [],
    ]
      .filter((bo: TrustBeneficialOwner) => bo.trust_ids?.includes(trustId))
      .map(bo => bo.id!);

  return {
    id: trustData.trust_id,
    name: trustData.trust_name,
    createdDateDay: trustData.creation_date_day,
    createdDateMonth: trustData.creation_date_month,
    createdDateYear: trustData.creation_date_year,
    hasAllInfo: trustData.unable_to_obtain_all_trust_info,
    beneficialOwnersIds: trustBoIds,
  };
};

const mapBoIndividualToPage = (
  beneficialOwner: BeneficialOwnerIndividual,
): Page.TrustBeneficialOwnerListItem => {
  return {
    id: beneficialOwner.id,
    name: [beneficialOwner.first_name, beneficialOwner.last_name].join(' '),
    type: BeneficialOwnerTypeChoice.individual,
  };
};

const mapBoOtherToPage = (
  beneficialOwner: BeneficialOwnerOther,
): Page.TrustBeneficialOwnerListItem => {
  return {
    id: beneficialOwner.id,
    name: beneficialOwner.name!,
    type: BeneficialOwnerTypeChoice.otherLegal,
  };
};

//  to session mapping
const mapDetailToSession = (
  formData: Page.TrustDetails,
): Trust => {
  const data = formData;

  return {
    trust_id: data.id,
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
  mapBoIndividualToPage,
  mapBoOtherToPage,
  mapDetailToSession,
  mapBeneficialOwnerToSession,
  generateTrustId,
};
