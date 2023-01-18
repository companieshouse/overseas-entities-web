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

export {
  TrustDetailsForm,
  TrustBeneficialOwnerListItem,
  TrustWhoIsInvolved,
  TrustHistoricalBeneficialOwnerForm,
  CommonTrustData,
};
