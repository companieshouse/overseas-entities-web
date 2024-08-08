import * as Trust from '../../model/trust.model';
import * as Page from '../../model/trust.page.model';
import { v4 as uuidv4 } from 'uuid';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { getIndividualTrustee } from '../../utils/trusts';
import { ApplicationData } from 'model';

enum YesOrNo {
  No = "0",
  Yes = "1"
}

const isYesOrNo = (value: string): boolean => Object.keys(YesOrNo).includes(value);

export const mapIndividualTrusteeToSession = (
  formData: Page.IndividualTrusteesFormCommon,
  trustee?: Trust.TrustIndividual
): Trust.IndividualTrustee => {
  let stillInvolved: string | null = (formData.stillInvolved === "1") ? "Yes" : "No";

  // If a boolean value isn't receieved from the web form (it could be null or undefined, e.g. if question not displayed), need to set null
  if (!formData.stillInvolved) {
    stillInvolved = null;
  }

  const data = {
    id: formData.trusteeId || uuidv4(),
    ch_references: trustee?.ch_references,
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
    still_involved: stillInvolved,
    start_date: formData.start_date,
    ceased_date_day: formData.stillInvolved === "0" ? formData.ceasedDateDay : "",
    ceased_date_month: formData.stillInvolved === "0" ? formData.ceasedDateMonth : "",
    ceased_date_year: formData.stillInvolved === "0" ? formData.ceasedDateYear : "",
    relevant_period: formData.relevant_period,
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
  const stillInvolvedInTrust: string = !trustee.still_involved || !isYesOrNo(trustee.still_involved) ? "" : YesOrNo[trustee.still_involved];

  const data = {
    trusteeId: trustee.id,
    is_newly_added: trustee.ch_references ? false : true,
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
    stillInvolved: stillInvolvedInTrust,
    ceasedDateDay: trustee.ceased_date_day,
    ceasedDateMonth: trustee.ceased_date_month,
    ceasedDateYear: trustee.ceased_date_year,
    relevant_period: trustee.relevant_period,
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
