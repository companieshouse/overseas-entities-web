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
    type: formData.roleWithinTrust,
    forename: formData.forename,
    other_forenames: '',
    surname: formData.surname,
    dob_day: formData.dateOfBirthDay,
    dob_month: formData.dateOfBirthMonth,
    dob_year: formData.dateOfBirthYear,
    nationality: formData.nationality,
    second_nationality: formData.second_nationality,
    ura_address_premises: formData.usual_residential_address_property_name_number,
    ura_address_line_1: formData.usual_residential_address_line_1,
    ura_address_line_2: formData.usual_residential_address_line_2,
    ura_address_locality: formData.usual_residential_address_town,
    ura_address_region: formData.usual_residential_address_county,
    ura_address_country: formData.usual_residential_address_country,
    ura_address_postal_code: formData.usual_residential_address_postcode,
    ura_address_care_of: '',
    ura_address_po_box: '',
    is_service_address_same_as_usual_residential_address: (formData.is_service_address_same_as_usual_residential_address) ? Number(formData.is_service_address_same_as_usual_residential_address) : 0,
    sa_address_care_of: '',
    sa_address_po_box: '',
  };

  let interestedPersonData = {};

  if (formData.roleWithinTrust === RoleWithinTrustType.INTERESTED_PERSON){
    interestedPersonData = {
      date_became_interested_person_day: formData.dateBecameIPDay,
      date_became_interested_person_month: formData.dateBecameIPMonth,
      date_became_interested_person_year: formData.dateBecameIPYear,
    };
  }

  if (formData.is_service_address_same_as_usual_residential_address?.toString() === "0") {
    return {
      ...data,
      ...interestedPersonData,
      sa_address_premises: formData.service_address_property_name_number,
      sa_address_line_1: formData.service_address_line_1,
      sa_address_line_2: formData.service_address_line_2,
      sa_address_locality: formData.service_address_town,
      sa_address_region: formData.service_address_county,
      sa_address_country: formData.service_address_country,
      sa_address_postal_code: formData.service_address_postcode,
    } as Trust.IndividualTrustee;
  } else {
    return {
      ...data,
      ...interestedPersonData,
      sa_address_premises: "",
      sa_address_line_1: "",
      sa_address_line_2: "",
      sa_address_locality: "",
      sa_address_region: "",
      sa_address_country: "",
      sa_address_postal_code: "",
    } as Trust.IndividualTrustee;
  }
};

export const mapIndividualTrusteeByIdFromSessionToPage = (
  appData: ApplicationData,
  trustId: string,
  trusteeId: string,
  isReview?: boolean
): Page.IndividualTrusteesFormCommon => {
  const trustee = getIndividualTrustee(appData, trustId, trusteeId, isReview);
  return mapIndividualTrusteeFromSessionToPage(trustee);
};

export const mapIndividualTrusteeFromSessionToPage = (
  trustee: Trust.IndividualTrustee,
): Page.IndividualTrusteesFormCommon => {
  const data = {
    trusteeId: trustee.id,
    roleWithinTrust: trustee.type,
    forename: trustee.forename,
    surname: trustee.surname,
    dateOfBirthDay: trustee.dob_day,
    dateOfBirthMonth: trustee.dob_month,
    dateOfBirthYear: trustee.dob_year,
    nationality: trustee.nationality,
    second_nationality: trustee.second_nationality,
    usual_residential_address_property_name_number: trustee.ura_address_premises,
    usual_residential_address_line_1: trustee.ura_address_line_1,
    usual_residential_address_line_2: trustee.ura_address_line_2,
    usual_residential_address_town: trustee.ura_address_locality,
    usual_residential_address_county: trustee.ura_address_region,
    usual_residential_address_country: trustee.ura_address_country,
    usual_residential_address_postcode: trustee.ura_address_postal_code,
    is_service_address_same_as_usual_residential_address: trustee.is_service_address_same_as_usual_residential_address,
    service_address_property_name_number: trustee.sa_address_premises,
    service_address_line_1: trustee.sa_address_line_1,
    service_address_line_2: trustee.sa_address_line_2,
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
