import { v4 as uuidv4 } from 'uuid';
import { TrusteeType } from '../../model/trustee.type.model';
import * as Trust from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { yesNoResponse } from '../../model/data.types.model';
import { getFormerTrustee } from '../../utils/trusts';
import { ApplicationData } from 'model';

const mapBeneficialOwnerToSession = (
  formData: Page.TrustHistoricalBeneficialOwnerForm,
  trustee?: Trust.TrustHistoricalBeneficialOwner
): Trust.TrustHistoricalBeneficialOwner => {
  const data = {
    id: formData.boId || generateBoId(),
    ch_references: trustee ? trustee.ch_references : undefined,
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
      corporate_indicator: yesNoResponse.Yes,
      corporate_name: formData.corporate_name,
    };
  }

  return {
    ...data,
    corporate_indicator: yesNoResponse.No,
    forename: formData.firstName,
    surname: formData.lastName,
  };
};

const mapFormerTrusteeByIdFromSessionToPage = (
  appData: ApplicationData,
  trustId: string,
  trusteeId: string,
): Page.TrustHistoricalBeneficialOwnerForm => {
  const trustee = getFormerTrustee(appData, trustId, trusteeId);
  return mapFormerTrusteeFromSessionToPage(trustee);
};

const mapFormerTrusteeFromSessionToPage = (
  trustee: Trust.TrustHistoricalBeneficialOwner
): Page.TrustHistoricalBeneficialOwnerForm => {
  const data = {
    boId: trustee.id,
    startDateDay: trustee.notified_date_day,
    startDateMonth: trustee.notified_date_month,
    startDateYear: trustee.notified_date_year,
    endDateDay: trustee.ceased_date_day,
    endDateMonth: trustee.ceased_date_month,
    endDateYear: trustee.ceased_date_year,
    is_newly_added: trustee.ch_references ? false : true
  };
  if (trustee.corporate_indicator === yesNoResponse.Yes && 'corporate_name' in trustee) {
    return {
      ...data,
      type: TrusteeType.LEGAL_ENTITY,
      corporate_name: trustee.corporate_name
    };
  }

  if ('forename' in trustee && 'surname' in trustee) {
    return {
      ...data,
      type: TrusteeType.INDIVIDUAL,
      firstName: trustee.forename,
      lastName: trustee.surname,
    };
  }

  return data as Page.TrustHistoricalBeneficialOwnerForm;
};

//  other
const generateBoId = (): string => {
  return uuidv4();
};

export {
  mapBeneficialOwnerToSession,
  mapFormerTrusteeFromSessionToPage,
  mapFormerTrusteeByIdFromSessionToPage,
  generateBoId,
};
