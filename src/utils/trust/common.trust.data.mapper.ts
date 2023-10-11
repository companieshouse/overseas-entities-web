import { ApplicationData } from '../../model';
import { CommonTrustData } from '../../model/trust.page.model';
import { getTrustByIdFromApp } from '../trusts';
import { getReviewTrustById } from '../../utils/update/review_trusts';

const mapCommonTrustDataToPage = (
  appData: ApplicationData,
  trustId: string,
  isReview: boolean
): CommonTrustData => {
  let trustData;
  if (isReview) {
    trustData = getReviewTrustById(appData, trustId);
  } else {
    trustData = getTrustByIdFromApp(appData, trustId);
  }

  return {
    trustId: trustData.trust_id,
    trustName: trustData.trust_name,
  };
};
export {
  mapCommonTrustDataToPage,
};
