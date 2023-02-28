import { v4 as uuidv4 } from "uuid";
import * as Trust from "../../model/trust.model";
import * as Page from "../../model/trust.page.model";
import { TrusteeType } from '../../model/trustee.type.model';

const mapLegalEntityToSession = (
  formData: Page.TrustLegalEntityForm
): Trust.TrustCorporate => {
  return {
    id: formData.legalEntityId || generateId(),
    type: formData.roleWithinTrust,
    name: formData.legalEntityName,
    date_became_interested_person_day: formData.interestedPersonStartDateDay,
    date_became_interested_person_month: formData.interestedPersonStartDateMonth,
    date_became_interested_person_year: formData.interestedPersonStartDateYear,
    ro_address_premises: formData.principal_address_property_name_number,
    ro_address_line1: formData.principal_address_line_1,
    ro_address_line2: formData.principal_address_line_2,
    ro_address_locality: formData.principal_address_town,
    ro_address_region: formData.principal_address_county,
    ro_address_country: formData.principal_address_country,
    ro_address_postal_code: formData.principal_address_postcode,
    ro_address_care_of: "",
    ro_address_po_box: "",
    sa_address_premises: formData.service_address_property_name_number,
    sa_address_line1: formData.service_address_line_1,
    sa_address_line2: formData.service_address_line_2,
    sa_address_locality: formData.service_address_town,
    sa_address_region: formData.service_address_county,
    sa_address_country: formData.service_address_country,
    sa_address_postal_code: formData.service_address_postcode,
    sa_address_care_of: "",
    sa_address_po_box: "",
    identification_legal_authority: formData.governingLaw,
    identification_legal_form: formData.legalForm,
    identification_place_registered: formData.public_register_name,
    identification_country_registration: formData.public_register_jurisdiction,
    identification_registration_number: formData.registration_number,
    is_service_address_same_as_principal_address: formData.is_service_address_same_as_principal_address,
    is_on_register_in_country_formed_in: formData.is_on_register_in_country_formed_in,
  };
};

const mapLegalEntityItemToPage = (
  legalEntity: Trust.TrustCorporate,
): Page.TrusteeItem => {
  return {
    id: legalEntity.id,
    name: legalEntity.name,
    trusteeItemType: TrusteeType.LEGAL_ENTITY,
  };
};

//  other
const generateId = (): string => {
  return uuidv4();
};

export {
  mapLegalEntityToSession,
  mapLegalEntityItemToPage,
  generateId,
};
