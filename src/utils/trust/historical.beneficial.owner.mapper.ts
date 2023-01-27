import { v4 as uuidv4 } from 'uuid';
import { BeneficialOwnerTypeChoice } from '../../model/beneficial.owner.type.model';
import * as Trust from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';

const mapBeneficialOwnerToSession = (
  formData: Page.TrustHistoricalBeneficialOwnerForm,
): Trust.TrustHistoricalBeneficialOwner => {
  const data = {
    id: formData.boId || generateBoId(),
    corporateIndicator: formData.type as Trust.TrustHistoricalBeneficialOwnerType,
    ceased_date_day: formData.startDateDay,
    ceased_date_month: formData.startDateMonth,
    ceased_date_year: formData.startDateYear,
    notified_date_day: formData.endDateDay,
    notified_date_month: formData.endDateMonth,
    notified_date_year: formData.endDateYear,
  };

  if (formData.type === BeneficialOwnerTypeChoice.otherLegal) {
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
