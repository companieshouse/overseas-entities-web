import * as Trust from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { v4 as uuidv4 } from 'uuid';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { TrusteeType } from '../../model/trustee.type.model';

export const mapIndividualTrusteeToSession = (
  formData: Page.IndividualTrusteesFormCommon,
): Trust.GeneralTrustee => {
  const data = {
    id: formData.trusteeId || uuidv4(),
    type: formData.type || TrusteeType.INDIVIDUAL,
    role: formData.role,
    forename: formData.forename,
    other_forenames: '',
    surname: formData.surname,
    date_of_birth_day: formData.date_of_birth_day,
    date_of_birth_month: formData.date_of_birth_month,
    date_of_birth_year: formData.date_of_birth_year,
    nationality: formData.nationality,
    second_nationality: formData.second_nationality,
    ura_address_premises: formData.property_name,
    ura_address_line1: formData.address_line1,
    ura_address_line2: formData.address_line2,
    ura_address_care_of: '',
    ura_address_locality: formData.city,
    ura_address_region: formData.county,
    ura_address_country: formData.country,
    ura_address_postal_code: formData.postal_code,
    ura_address_po_box: '',
    sa_address_premises: formData.correspondence_property_name,
    sa_address_line1: formData.correspondence_address_line1,
    sa_address_line2: formData.correspondence_address_line2,
    sa_address_locality: formData.correspondence_city,
    sa_address_region: formData.correspondence_county,
    sa_address_country: formData.correspondence_country,
    sa_address_postal_code: formData.correspondence_postal_code,
    sa_address_care_of: '',
    sa_address_po_box: '',
  };

  if (formData.role === RoleWithinTrustType.INTERESTED_PERSON){
    return {
      ...data,
      date_became_interested_person_day: formData.date_became_ip_day,
      date_became_interested_person_month: formData.date_became_ip_month,
      date_became_interested_person_year: formData.date_became_ip_year,
    } as Trust.GeneralTrustee;
  }
  return {
    ...data as Trust.GeneralTrustee
  };
};
