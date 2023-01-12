import { BeneficialOwnerTypeChoice } from 'model/beneficial.owner.type.model';

type TrustDetails = {
  id: string;
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
  id: string;
  trustName: string;
  boInTrust: TrustBeneficialOwnerListItem[];
};

export {
  TrustDetails,
  TrustBeneficialOwnerListItem,
  TrustWhoIsInvolved,
};
