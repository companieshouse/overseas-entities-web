import * as Trust from 'model/trust.model';
import { TrustWhoIsInvolved } from 'model/trust.page.model';

const mapTrustWhoIsInvolvedToPage = (
  data: Trust.Trust | undefined,
): TrustWhoIsInvolved => {
  if (!data) {
    return {} as TrustWhoIsInvolved;
  }

  return {
    id: data.trust_id,
    trustName: data.trust_name,
  };
};
export {
  mapTrustWhoIsInvolvedToPage,
};
