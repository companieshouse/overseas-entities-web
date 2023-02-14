import * as Trust from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { v4 as uuidv4 } from 'uuid';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';

export const mapIndividualTrusteeToSession = (
  formData: Page.IndividualTrusteesFormCommon,
): Trust.IndividualTrustee => {
  const data = {
    id: formData.trustee_id || uuidv4(),
    type: formData.type,
    forename: formData.forename,
    other_forenames: '',
    surname: formData.surname,
    date_of_birth_day: formData.date_of_birth_day,
    date_of_birth_month: formData.date_of_birth_month,
    date_of_birth_year: formData.date_of_birth_year,
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
    is_service_address_same_as_principal_address: formData.is_service_address_same_as_principal_address,
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
      date_became_interested_person_day: formData.date_became_ip_day,
      date_became_interested_person_month: formData.date_became_ip_month,
      date_became_interested_person_year: formData.date_became_ip_year,
    } as Trust.IndividualTrustee;
  }
  return {
    ...data as Trust.IndividualTrustee
  };
};
