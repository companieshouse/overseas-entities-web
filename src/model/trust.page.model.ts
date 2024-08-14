import { BeneficialOwnerTypeChoice } from './beneficial.owner.type.model';
import { TrusteeType } from './trustee.type.model';
import { RoleWithinTrustType } from './role.within.trust.type.model';
import { yesNoResponse } from './data.types.model';

type TrustDetailsForm = {
  trustId: string;
  name: string;
  createdDateDay: string;
  createdDateMonth: string;
  createdDateYear: string;
  ceasedDateDay?: string;
  ceasedDateMonth?: string;
  ceasedDateYear?: string;
  stillInvolved?: string;
  beneficialOwnersIds: string[];
  hasAllInfo: string;
  relevant_period?: boolean;
};

type TrustBeneficialOwnerListItem = {
  id: string;
  is_newly_added?: boolean;
  name: string;
  type: BeneficialOwnerTypeChoice;
};

type TrustWhoIsInvolved = {
  boInTrust: TrustBeneficialOwnerListItem[];
  trustees: TrusteeItem[];
};

type TrustWhoIsInvolvedForm = {
  typeOfTrustee: string;
};

interface TrustHistoricalBeneficialOwnerFormCommon {
  boId?: string;
  is_newly_added: boolean;
  type: string;
  startDateDay: string;
  startDateMonth: string;
  startDateYear: string;
  endDateDay: string;
  endDateMonth: string;
  endDateYear: string;
}

type IndividualTrusteesFormCommon = {
  trusteeId?: string,
  roleWithinTrust: RoleWithinTrustType,
  forename: string,
  surname: string,
  dateOfBirthDay: string,
  dateOfBirthMonth: string,
  dateOfBirthYear: string,
  nationality: string,
  second_nationality?: string,
  usual_residential_address_property_name_number: string,
  usual_residential_address_line_1: string,
  usual_residential_address_line_2?: string,
  usual_residential_address_town: string,
  usual_residential_address_county?: string,
  usual_residential_address_country: string,
  usual_residential_address_postcode?: string,
  service_address_property_name_number?: string,
  service_address_line_1?: string,
  service_address_line_2?: string,
  service_address_town?: string,
  service_address_county?: string,
  service_address_country?: string,
  service_address_postcode?: string,
  is_service_address_same_as_usual_residential_address: yesNoResponse,
  dateBecameIPDay?: string,
  dateBecameIPMonth?: string,
  dateBecameIPYear?: string,
  stillInvolved?: string,
  ceasedDateDay?: string,
  ceasedDateMonth?: string,
  ceasedDateYear?: string,
  relevant_period: boolean;
};

interface TrustHistoricalBeneficialOwnerFormLegal extends TrustHistoricalBeneficialOwnerFormCommon {
  type: TrusteeType.LEGAL_ENTITY;
  corporate_name: string;
}

interface TrustHistoricalBeneficialOwnerFormIndividual extends TrustHistoricalBeneficialOwnerFormCommon {
  type: TrusteeType.INDIVIDUAL;
  firstName: string;
  lastName: string;
}

type TrustHistoricalBeneficialOwnerForm = TrustHistoricalBeneficialOwnerFormIndividual
  | TrustHistoricalBeneficialOwnerFormLegal;

type CommonTrustData = {
  trustId: string;
  trustName: string;
};

type TrustLegalEntityForm = {
  legalEntityId?: string;
  legalEntityName: string;
  roleWithinTrust: string;
  interestedPersonStartDateDay?: string;
  interestedPersonStartDateMonth?: string;
  interestedPersonStartDateYear?: string;
  principal_address_property_name_number: string;
  principal_address_line_1: string;
  principal_address_line_2?: string;
  principal_address_town: string;
  principal_address_county: string;
  principal_address_country: string;
  principal_address_postcode: string;
  service_address_property_name_number?: string;
  service_address_line_1?: string;
  service_address_line_2?: string;
  service_address_town?: string;
  service_address_county?: string;
  service_address_country?: string;
  service_address_postcode?: string;
  governingLaw: string;
  legalForm: string;
  public_register_name?: string;
  public_register_jurisdiction?: string;
  registration_number?: string;
  is_service_address_same_as_principal_address: yesNoResponse;
  is_on_register_in_country_formed_in: yesNoResponse;
  ceasedDateDay?: string;
  ceasedDateMonth?: string;
  ceasedDateYear?: string;
  startDateDay: string;
  startDateMonth: string;
  startDateYear: string;
  stillInvolved?: string;
  relevant_period?: boolean;
};

type TrusteeItem = {
    id?: string;
    name: string;
    trusteeItemType: TrusteeType;
    is_newly_added: boolean
};

 enum AddTrust {
    addTrustYes = "addTrustYes",
    preRegistration = "preRegistration",
    noTrust = "noTrust"
}

export {
  TrustDetailsForm,
  TrustBeneficialOwnerListItem,
  TrustWhoIsInvolved,
  TrustWhoIsInvolvedForm,
  TrustHistoricalBeneficialOwnerForm,
  CommonTrustData,
  TrustLegalEntityForm,
  IndividualTrusteesFormCommon,
  TrusteeItem,
  AddTrust,
};
