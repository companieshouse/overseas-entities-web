import * as Page from 'model/trust.page.model';
import { Trust } from 'model/trust.model';

const mapTrustToPage = (
  trustData: Trust | undefined,
): Page.TrustDetails => {
  if (!trustData) {
    return {} as Page.TrustDetails;
  }

  return {
    id: trustData.trust_id,
    name: trustData.trust_name,
    createdDateDay: trustData.creation_date_day,
    createdDateMonth: trustData.creation_date_month,
    createdDateYear: trustData.creation_date_year,
    hasAllInfo: trustData.unable_to_obtain_all_trust_info,
    beneficialOwnersIds: [],
  };
};

export {
  mapTrustToPage,
};
