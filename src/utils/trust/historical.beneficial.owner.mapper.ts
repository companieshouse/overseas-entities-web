import { v4 as uuidv4 } from 'uuid';
import { TrusteeType } from '../../model/trustee.type.model';
import * as Trust from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';

const mapBeneficialOwnerToSession = (
  formData: Page.TrustHistoricalBeneficialOwnerForm,
): Trust.TrustHistoricalBeneficialOwner => {
  const data = {
    id: formData.boId || generateBoId(),
    corporateIndicator: formData.type as TrusteeType,
    notified_date_day: formData.startDateDay,
    notified_date_month: formData.startDateMonth,
    notified_date_year: formData.startDateYear,
    ceased_date_day: formData.endDateDay,
    ceased_date_month: formData.endDateMonth,
    ceased_date_year: formData.endDateYear,
  };

  if (formData.type === TrusteeType.LEGAL_ENTITY) {
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
  mapBeneficialOwnerToSession,
  generateBoId,
};
