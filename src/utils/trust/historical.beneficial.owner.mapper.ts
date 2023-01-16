import { v4 as uuidv4 } from 'uuid';
import { ApplicationData } from '../../model';
import * as Trust from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { getTrustByIdFromApp } from '../../utils/trusts';

const mapTrustToPage = (
  appData: ApplicationData,
  trustId: string,
): Page.TrustHistoricalBeneficialOwner => {
  const data = getTrustByIdFromApp(appData, trustId);

  return {
    trustId: data.trust_id,
    trustName: data.trust_name,
  };
};

const mapBeneficialOwnerToSession = (
  formData: Page.TrustHistoricalBeneficialOwnerForm,
): Trust.TrustHistoricalBeneficialOwner => {
  const data = {
    id: formData.boId || generateBoId(),
    corporateIndicator: formData.type as Trust.TrustHistoricalBeneficialOwnerType,
    ceased_date_day: formData.ceasedDateDay,
    ceased_date_month: formData.ceasedDateMonth,
    ceased_date_year: formData.ceasedDateYear,
    notified_date_day: formData.notifiedDateDay,
    notified_date_month: formData.notifiedDateMonth,
    notified_date_year: formData.notifiedDateYear,
  };

  if (formData.type === '1') {
    return {
      ...data,
      corporateName: formData.corporateName,
    };
  }

  return {
    ...data,
    forename: formData.firstName,
    surname: formData.lastName,
  };
};

//  other
const generateBoId = (): string => {
  return uuidv4();
};

export {
  mapTrustToPage,
  mapBeneficialOwnerToSession,
  generateBoId,
};
