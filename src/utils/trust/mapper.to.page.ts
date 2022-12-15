import * as Trust from 'model/trust.model';
import * as Page from 'model/trust.page.model';

const mapDetailToPage = (
  data: Trust.Trust | undefined,
): Page.TrustDetails => {
  if (!data) {
    return {} as Page.TrustDetails;
  }

  return {
    id: data.trust_id,
    name: data.trust_name,
    createdDateDay: data.creation_date_day,
    createdDateMonth: data.creation_date_month,
    createdDateYear: data.creation_date_year,
    beneficialOwners: data.HISTORICAL_BO?.map((bo, idx) => mapBeneficialOwnerToPage(bo, idx)) ?? [],
    hasAllInfo: data.unable_to_obtain_all_trust_info,
  };
};

const mapBeneficialOwnerToPage = (
  data: Trust.TrustHistoricalBeneficialOwner | undefined,
  index: number,
): Page.TrustBeneficialOwner => {
  if (!data) {
    return {} as Page.TrustBeneficialOwner;
  }

  return {
    id: String(index),
    forename: data.forename,
    otherForenames: data.other_forenames,
    surname: data.surname,
    ceasedDateDay: data.ceased_date_day,
    ceasedDateMonth: data.ceased_date_month,
    ceasedDateYear: data.ceased_date_year,
    notifiedDateDay: data.notified_date_day,
    notifiedDateMonth: data.notified_date_month,
    notifiedDateYear: data.notified_date_year,
  } as Page.TrustBeneficialOwner;
};

export {
  mapDetailToPage,
  mapBeneficialOwnerToPage,
};
