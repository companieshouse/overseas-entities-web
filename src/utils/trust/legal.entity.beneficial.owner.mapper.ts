import { v4 as uuidv4 } from "uuid";
import * as Trust from "../../model/trust.model";
import * as Page from "../../model/trust.page.model";
import { TrusteeType } from '../../model/trustee.type.model';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { getLegalEntityTrustee } from '../../utils/trusts';
import { ApplicationData } from 'model';

const mapLegalEntityToSession = (
  formData: Page.TrustLegalEntityForm,
  trustee?: Trust.TrustCorporate
): Trust.TrustCorporate => {

  const data = {
    id: formData.legalEntityId || generateId(),
    ch_references: trustee?.ch_references,
    type: formData.roleWithinTrust,
    name: formData.legalEntityName,
    date_became_interested_person_day: formData.interestedPersonStartDateDay,
    date_became_interested_person_month: formData.interestedPersonStartDateMonth,
    date_became_interested_person_year: formData.interestedPersonStartDateYear,
    ro_address_premises: formData.principal_address_property_name_number,
    ro_address_line_1: formData.principal_address_line_1,
    ro_address_line_2: formData.principal_address_line_2,
    ro_address_locality: formData.principal_address_town,
    ro_address_region: formData.principal_address_county,
    ro_address_country: formData.principal_address_country,
    ro_address_postal_code: formData.principal_address_postcode,
    ro_address_care_of: "",
    ro_address_po_box: "",
    sa_address_care_of: "",
    sa_address_po_box: "",
    identification_legal_authority: formData.governingLaw,
    identification_legal_form: formData.legalForm,
    is_service_address_same_as_principal_address: (formData.is_service_address_same_as_principal_address) ? Number(formData.is_service_address_same_as_principal_address) : 0,
    is_on_register_in_country_formed_in: (formData.is_on_register_in_country_formed_in) ? Number(formData.is_on_register_in_country_formed_in) : 0,
    ceased_date_day: formData. ceased_date_day,
    ceased_date_month: formData. ceased_date_month,
    ceased_date_year: formData. ceased_date_year,
  };

  let stillInvolved = (formData.stillInvolved === "1") ? "Yes" : "No";

  if (formData.stillInvolved === null || formData.stillInvolved === undefined) {
    stillInvolved = null as unknown as string;
  }

  let publicRegisterData = {};
  if (formData.is_on_register_in_country_formed_in?.toString() === "1"){
    publicRegisterData = {
      identification_place_registered: formData.public_register_name,
      identification_country_registration: formData.public_register_jurisdiction,
      identification_registration_number: formData.registration_number,
    };
  }

  let interestedPersonData = {};
  if (formData.roleWithinTrust === RoleWithinTrustType.INTERESTED_PERSON){
    interestedPersonData = {
      date_became_interested_person_day: formData.interestedPersonStartDateDay,
      date_became_interested_person_month: formData.interestedPersonStartDateMonth,
      date_became_interested_person_year: formData.interestedPersonStartDateYear,
    };
  }

  if (formData.is_service_address_same_as_principal_address?.toString() === "0") {
    return {
      ...data,
      ...publicRegisterData,
      ...interestedPersonData,
      sa_address_premises: formData.service_address_property_name_number,
      sa_address_line_1: formData.service_address_line_1,
      sa_address_line_2: formData.service_address_line_2,
      sa_address_locality: formData.service_address_town,
      sa_address_region: formData.service_address_county,
      sa_address_country: formData.service_address_country,
      sa_address_postal_code: formData.service_address_postcode,
      is_corporate_still_involved_in_trust: stillInvolved,
    } as Trust.TrustCorporate;
  } else {
    return {
      ...data,
      ...publicRegisterData,
      ...interestedPersonData,
      sa_address_premises: "",
      sa_address_line_1: "",
      sa_address_line_2: "",
      sa_address_locality: "",
      sa_address_region: "",
      sa_address_country: "",
      sa_address_postal_code: "",
      is_corporate_still_involved_in_trust: stillInvolved,
    } as Trust.TrustCorporate;
  }
};

const mapLegalEntityTrusteeByIdFromSessionToPage = (
  appData: ApplicationData,
  trustId: string,
  trusteeId: string,
  isReview?: boolean
): Page.TrustLegalEntityForm => {
  const trustee = getLegalEntityTrustee(appData, trustId, trusteeId, isReview);
  return mapLegalEntityTrusteeFromSessionToPage(trustee);
};

const mapLegalEntityTrusteeFromSessionToPage = (
  trustee: Trust.TrustCorporate
): Page.TrustLegalEntityForm => {
  const data = {
    legalEntityId: trustee.id,
    is_newly_added: trustee.ch_references ? false : true,
    roleWithinTrust: trustee.type,
    legalEntityName: trustee.name,
    principal_address_property_name_number: trustee.ro_address_premises,
    principal_address_line_1: trustee.ro_address_line_1,
    principal_address_line_2: trustee.ro_address_line_2,
    principal_address_town: trustee.ro_address_locality,
    principal_address_county: trustee.ro_address_region,
    principal_address_country: trustee.ro_address_country,
    principal_address_postcode: trustee.ro_address_postal_code,
    service_address_property_name_number: trustee.sa_address_premises,
    service_address_line_1: trustee.sa_address_line_1,
    service_address_line_2: trustee.sa_address_line_2,
    service_address_town: trustee.sa_address_locality,
    service_address_county: trustee.sa_address_region,
    service_address_country: trustee.sa_address_country,
    service_address_postcode: trustee.sa_address_postal_code,
    governingLaw: trustee.identification_legal_authority,
    legalForm: trustee.identification_legal_form,
    public_register_name: trustee.identification_place_registered,
    public_register_jurisdiction: trustee.identification_country_registration,
    registration_number: trustee.identification_registration_number,
    is_service_address_same_as_principal_address: trustee.is_service_address_same_as_principal_address,
    is_on_register_in_country_formed_in: trustee.is_on_register_in_country_formed_in,
  } as Page.TrustLegalEntityForm;

  let isCorporateStillInvolvedInTrust: string;
  switch (trustee.is_corporate_still_involved_in_trust) {
    case "Yes":
      isCorporateStillInvolvedInTrust = "1";
      break;
    case "No":
      isCorporateStillInvolvedInTrust = "0";
      break;
    default:
      isCorporateStillInvolvedInTrust = ""; // forces user to enter a value on new legal entity
      break;
  }

  if (trustee.type === RoleWithinTrustType.INTERESTED_PERSON){
    return {
      ...data,
      interestedPersonStartDateDay: trustee.date_became_interested_person_day,
      interestedPersonStartDateMonth: trustee.date_became_interested_person_month,
      interestedPersonStartDateYear: trustee.date_became_interested_person_year,
      principal_address_property_name_number: trustee.ro_address_premises,
      ceasedDateDay: trustee.ceased_date_day,
      ceasedDateMonth: trustee.ceased_date_month,
      ceasedDateYear: trustee.ceased_date_year,
      stillInvolved: isCorporateStillInvolvedInTrust,
    } as Page.TrustLegalEntityForm;
  }
  return data;
};

const mapLegalEntityItemToPage = (
  legalEntity: Trust.TrustCorporate,
): Page.TrusteeItem => {
  return {
    id: legalEntity.id,
    name: legalEntity.name,
    trusteeItemType: TrusteeType.LEGAL_ENTITY,
    is_newly_added: legalEntity.ch_references ? false : true
  };
};

//  other
const generateId = (): string => {
  return uuidv4();
};

export {
  mapLegalEntityToSession,
  mapLegalEntityTrusteeFromSessionToPage,
  mapLegalEntityTrusteeByIdFromSessionToPage,
  mapLegalEntityItemToPage,
  generateId,
};
