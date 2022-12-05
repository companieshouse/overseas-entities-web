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

export {
  TrustDetails,
  TrustBeneficialOwner,
};
