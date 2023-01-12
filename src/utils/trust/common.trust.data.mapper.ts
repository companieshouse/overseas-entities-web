import * as Trust from 'model/trust.model';
import { CommonTrustData } from 'model/trust.page.model';

const mapCommonTrustDataToPage = (
  data: Trust.Trust | undefined,
): CommonTrustData => {
  if (!data) {
    return {} as CommonTrustData;
  }

  return {
    id: data.trust_id,
    trustName: data.trust_name,
  };
};
export {
  mapCommonTrustDataToPage,
};
