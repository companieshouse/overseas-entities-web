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
  trustId: string;
  trustName: string;
  boInTrust: TrustBeneficialOwnerListItem[];
};

type TrustHistoricalBeneficialOwner = {
  trustId: string;
  trustName: string;
};

interface TrustHistoricalBeneficialOwnerFormBasic {
  boId?: string;
  type: string;
  ceasedDateDay: string;
  ceasedDateMonth: string;
  ceasedDateYear: string;
  notifiedDateDay: string;
  notifiedDateMonth: string;
  notifiedDateYear: string;
}

interface  TrustHistoricalBeneficialOwnerFormLegal extends TrustHistoricalBeneficialOwnerFormBasic {
  type: '1';
  corporateName: string;
}

interface TrustHistoricalBeneficialOwnerFormIndividual extends TrustHistoricalBeneficialOwnerFormBasic {
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

export {
  TrustDetailsForm,
  TrustBeneficialOwnerListItem,
  TrustWhoIsInvolved,
  TrustHistoricalBeneficialOwner,
  TrustHistoricalBeneficialOwnerForm,
  CommonTrustData,
};
