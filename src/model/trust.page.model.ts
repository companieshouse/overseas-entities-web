type TrustDetails = {
  id: string;
  name: string;
  createdDateDay: string;
  createdDateMonth: string;
  createdDateYear: string;
  beneficialOwners: TrustBeneficialOwner[];
  hasAllInfo: string;
};

type TrustBeneficialOwner = {
  id: string;
  forename?: string;
  otherForenames?: string;
  surname?: string;
  ceasedDateDay: string;
  ceasedDateMonth: string;
  ceasedDateYear: string;
  notifiedDateDay: string;
  notifiedDateMonth: string;
  notifiedDateYear: string;
};

type TrustWhoIsInvolved = {
  id: string;
  trustName: string;
};

type TrustHistoricalBeneficialOwnerPage = {
  id: string;
  trustName: string;
  TrustHistoricalBeneficialOwner: TrustHistoricalBeneficialOwner[];

};

type TrustHistoricalBeneficialOwner = {
  id: string;
  trustName: string;
  forename?: string;
  otherForenames?: string;
  surname?: string;
  ceasedDateDay: string;
  ceasedDateMonth: string;
  ceasedDateYear: string;
  notifiedDateDay: string;
  notifiedDateMonth: string;
  notifiedDateYear: string;
};

export {
  TrustDetails,
  TrustBeneficialOwner,
  TrustWhoIsInvolved,
  TrustHistoricalBeneficialOwnerPage,
  TrustHistoricalBeneficialOwner,
};
