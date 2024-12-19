import { ApplicationData } from '../../model';
import { CommonTrustData } from '../../model/trust.page.model';
import { getReviewTrustById } from '../../utils/update/review_trusts';
import { getTrustByIdFromApp } from '../trusts';

const mapCommonTrustDataToPage = (
  appData: ApplicationData,
  trustId: string,
  isReview: boolean
): CommonTrustData => {
  const trustData = isReview ? getReviewTrustById(appData, trustId) : getTrustByIdFromApp(appData, trustId);
  return {
    trustId: trustData.trust_id,
    trustName: trustData.trust_name,
  };
};

export {
  mapCommonTrustDataToPage,
};
