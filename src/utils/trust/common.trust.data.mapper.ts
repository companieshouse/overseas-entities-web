import { ApplicationData } from '../../model';
import { CommonTrustData } from '../../model/trust.page.model';
import { getTrustByIdFromApp } from '../trusts';

const mapCommonTrustDataToPage = (
  appData: ApplicationData,
  trustId: string,
  isReview?: boolean
): CommonTrustData => {
  const trustData = getTrustByIdFromApp(appData, trustId, isReview);

  return {
    trustId: trustData.trust_id,
    trustName: trustData.trust_name,
  };
};
export {
  mapCommonTrustDataToPage,
};
