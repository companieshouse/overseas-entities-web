import { v4 as uuidv4 } from "uuid";
import * as Trust from "../../model/trust.model";
import * as Page from "../../model/trust.page.model";
import { TrusteeType } from '../../model/trustee.type.model';
import { RoleWithinTrustType } from '../../model/role.within.trust.type.model';
import { getLegalEntityTrustee } from '../../utils/trusts';
import { ApplicationData } from 'model';

enum YesOrNo {
  No = "0",
  Yes = "1"
}

const isYesOrNo = (value: string): boolean =>
  Object.keys(YesOrNo).includes(value);

const mapLegalEntityToSession = (
  formData: Page.TrustLegalEntityForm,
  trustee?: Trust.TrustCorporate
): Trust.TrustCorporate => {

  const data = {
    id: formData.legalEntityId || generateId(),
    ch_references: trustee?.ch_references,
    type: formData.roleWithinTrust,
    name: formData.legalEntityName,
    date_became_interested_person_day: formData.dateBecameIPDay,
    date_became_interested_person_month: formData.dateBecameIPMonth,
    date_became_interested_person_year: formData.dateBecameIPYear,
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
    ceased_date_day: formData.stillInvolved === "0" ? formData.ceasedDateDay : "",
    ceased_date_month: formData.stillInvolved === "0" ? formData.ceasedDateMonth : "",
    ceased_date_year: formData.stillInvolved === "0" ? formData.ceasedDateYear : "",
  };

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
      date_became_interested_person_day: formData.dateBecameIPDay,
      date_became_interested_person_month: formData.dateBecameIPMonth,
      date_became_interested_person_year: formData.dateBecameIPYear,
    };
  }

  let stillInvolved = (formData.stillInvolved === "1") ? "Yes" : "No";

  // If a boolean value isn't receieved from the web form (it could be null or undefined, e.g. if question not displayed), need to set null
  if (formData.stillInvolved === null || formData.stillInvolved === undefined) {
    stillInvolved = null as unknown as string;
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
      still_involved: stillInvolved,
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
      still_involved: stillInvolved,
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
    ceasedDateDay: trustee.ceased_date_day,
    ceasedDateMonth: trustee.ceased_date_month,
    ceasedDateYear: trustee.ceased_date_year,
  } as Page.TrustLegalEntityForm;

  const stillInvolvedInTrust: string =
  !trustee.still_involved || !isYesOrNo(trustee.still_involved) ? "" : YesOrNo[trustee.still_involved];

  if (trustee.type === RoleWithinTrustType.INTERESTED_PERSON) {
    return {
      ...data,
      dateBecameIPDay: trustee.date_became_interested_person_day,
      dateBecameIPMonth: trustee.date_became_interested_person_month,
      dateBecameIPYear: trustee.date_became_interested_person_year,
      principal_address_property_name_number: trustee.ro_address_premises,
      stillInvolved: stillInvolvedInTrust,
    } as Page.TrustLegalEntityForm;
  }
  return {
    ...data,
    stillInvolved: stillInvolvedInTrust,
  } as Page.TrustLegalEntityForm;
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
