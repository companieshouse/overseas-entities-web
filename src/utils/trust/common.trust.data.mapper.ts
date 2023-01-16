import { ApplicationData } from 'model';
import { Trust, TrustKey } from '../../model/trust.model';
import { CommonTrustData } from 'model/trust.page.model';

const mapCommonTrustDataToPage = (
  appData: ApplicationData,
  trustId: string,
): CommonTrustData => {
  const trustData = appData[TrustKey]?.find(trust => trust.trust_id === trustId) ?? {} as Trust;

  return {
    id: trustData.trust_id,
    trustName: trustData.trust_name,
  };
};
export {
  mapCommonTrustDataToPage,
};
