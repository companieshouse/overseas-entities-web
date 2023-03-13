import * as Trust from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { v4 as uuidv4 } from 'uuid';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { getIndividualTrustee } from '../../utils/trusts';
import { ApplicationData } from 'model';

export const mapIndividualTrusteeToSession = (
  formData: Page.IndividualTrusteesFormCommon,
): Trust.IndividualTrustee => {
  const data = {
    id: formData.trusteeId || uuidv4(),
    type: formData.type,
    forename: formData.forename,
    other_forenames: '',
    surname: formData.surname,
    date_of_birth_day: formData.dateOfBirthDay,
    date_of_birth_month: formData.dateOfBirthMonth,
    date_of_birth_year: formData.dateOfBirthYear,
    nationality: formData.nationality,
    second_nationality: formData.second_nationality,
    ura_address_premises: formData.usual_residential_address_property_name_number,
    ura_address_line1: formData.usual_residential_address_line_1,
    ura_address_line2: formData.usual_residential_address_line_2,
    ura_address_locality: formData.usual_residential_address_town,
    ura_address_region: formData.usual_residential_address_county,
    ura_address_country: formData.usual_residential_address_country,
    ura_address_postal_code: formData.usual_residential_address_postcode,
    ura_address_care_of: '',
    ura_address_po_box: '',
    is_service_address_same_as_usual_residential_address: formData.is_service_address_same_as_usual_residential_address,
    sa_address_premises: formData.service_address_property_name_number,
    sa_address_line1: formData.service_address_line_1,
    sa_address_line2: formData.service_address_line_2,
    sa_address_locality: formData.service_address_town,
    sa_address_region: formData.service_address_county,
    sa_address_country: formData.service_address_country,
    sa_address_postal_code: formData.service_address_postcode,
    sa_address_care_of: '',
    sa_address_po_box: '',
  };

  if (formData.type === RoleWithinTrustType.INTERESTED_PERSON){
    return {
      ...data,
      date_became_interested_person_day: formData.dateBecameIPDay,
      date_became_interested_person_month: formData.dateBecameIPMonth,
      date_became_interested_person_year: formData.dateBecameIPYear,
    } as Trust.IndividualTrustee;
  }
  return {
    ...data as Trust.IndividualTrustee
  };
};

export const mapIndividualTrusteeFromSessionToPage = (
  appData: ApplicationData,
  trustId: string,
  trusteeId: string,
): Page.IndividualTrusteesFormCommon => {
  const trustee = getIndividualTrustee(appData, trustId, trusteeId);

  const data = {
    trusteeId: trustee.id,
    type: trustee.type,
    forename: trustee.forename,
    surname: trustee.surname,
    dateOfBirthDay: trustee.date_of_birth_day,
    dateOfBirthMonth: trustee.date_of_birth_month,
    dateOfBirthYear: trustee.date_of_birth_year,
    nationality: trustee.nationality,
    second_nationality: trustee.second_nationality,
    usual_residential_address_property_name_number: trustee.ura_address_premises,
    usual_residential_address_line_1: trustee.ura_address_line1,
    usual_residential_address_line_2: trustee.ura_address_line2,
    usual_residential_address_town: trustee.ura_address_locality,
    usual_residential_address_county: trustee.ura_address_region,
    usual_residential_address_country: trustee.ura_address_country,
    usual_residential_address_postcode: trustee.ura_address_postal_code,
    is_service_address_same_as_usual_residential_address: trustee.is_service_address_same_as_usual_residential_address,
    service_address_property_name_number: trustee.sa_address_premises,
    service_address_line_1: trustee.sa_address_line1,
    service_address_line_2: trustee.sa_address_line2,
    service_address_town: trustee.sa_address_locality,
    service_address_county: trustee.sa_address_region,
    service_address_country: trustee.sa_address_country,
    service_address_postcode: trustee.sa_address_postal_code,
  };

  if (trustee.type === RoleWithinTrustType.INTERESTED_PERSON){
    return {
      ...data,
      dateBecameIPDay: trustee.date_became_interested_person_day,
      dateBecameIPMonth: trustee.date_became_interested_person_month,
      dateBecameIPYear: trustee.date_became_interested_person_year,
    } as Page.IndividualTrusteesFormCommon;
  }
  return {
    ...data as Page.IndividualTrusteesFormCommon
  };
};
