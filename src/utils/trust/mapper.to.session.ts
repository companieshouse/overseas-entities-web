import * as Trust from 'model/trust.model';
import * as Page from 'model/trust.page.model';

const mapDetailToSession = (
  data: Page.TrustDetails,
): Trust.Trust => {
  return {
    trust_id: data.id,
    trust_name: data.name,
    creation_date_day: data.createdDateDay,
    creation_date_month: data.createdDateMonth,
    creation_date_year: data.createdDateYear,
    unable_to_obtain_all_trust_info: data.hasAllInfo,
  };
};

export {
  mapDetailToSession,
};
