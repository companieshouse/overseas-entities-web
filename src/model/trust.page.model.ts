import { BeneficialOwnerTypeChoice } from 'model/beneficial.owner.type.model';

type TrustDetailsForm = {
  trustId: string;
  name: string;
  createdDateDay: string;
  createdDateMonth: string;
  createdDateYear: string;
  beneficialOwnersIds: string[];
  hasAllInfo: string;
};

type TrustBeneficialOwnerListItem = {
  id: string;
  name: string;
  type: BeneficialOwnerTypeChoice,
};

type TrustWhoIsInvolved = {
  boInTrust: TrustBeneficialOwnerListItem[];
};

type TrustWhoIsInvolvedForm = {
  typeOfTrustee: string;
};

interface TrustHistoricalBeneficialOwnerFormCommon {
  boId?: string;
  type: string;
  startDateDay: string;
  startDateMonth: string;
  startDateYear: string;
  endDateDay: string;
  endDateMonth: string;
  endDateYear: string;
}

interface  TrustHistoricalBeneficialOwnerFormLegal extends TrustHistoricalBeneficialOwnerFormCommon  {
  type: '1';
  corporateName: string;
}

interface TrustHistoricalBeneficialOwnerFormIndividual extends TrustHistoricalBeneficialOwnerFormCommon  {
  type: '0';
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
interestedPersonStartDateDay?: string
interestedPersonStartDateMonth?: string
interestedPersonStartDateYear?: string
principal_address_property_name_number: string
principal_address_line_1: string
principal_address_line_2?: string
principal_address_town: string
principal_address_county: string
principal_address_country: string
principal_address_postcode: string
service_address_property_name_number?: string
service_address_line_1?: string
service_address_line_2?: string
service_address_town?: string
service_address_county?: string
service_address_country?: string
service_address_postcode?: string
governingLaw: string
legalForm: string
public_register_name?: string
public_register_jurisdiction?: string
registration_number?: string
};

export {
  TrustDetailsForm,
  TrustBeneficialOwnerListItem,
  TrustWhoIsInvolved,
  TrustWhoIsInvolvedForm,
  TrustHistoricalBeneficialOwnerForm,
  CommonTrustData,
  TrustLegalEntityForm,
};
