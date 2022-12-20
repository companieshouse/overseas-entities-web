import * as Trust from 'model/trust.model';
import * as Page from 'model/trust.page.model';


const mapTrustDetailToPage = (
  data: Trust.Trust | undefined,
): Page.TrustHistoricalBeneficialOwnerPage => {
  if (!data) {
    return {} as Page.TrustHistoricalBeneficialOwnerPage;
  }

  return {
    id: data.trust_id,
    trustName: data.trust_name,
    TrustHistoricalBeneficialOwner: [],
  };
};

export {
  mapTrustDetailToPage,
};
