import { BeneficialOwnerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";

export const PRIVATE_BO_ADDRESS = {
  addressLine1: "1 Some Street",
  addressLine2: "Next Street",
  careOf: "",
  country: "United Kingdom",
  locality: "London",
  poBox: "",
  postalCode: "ABC 123",
  premises: "Pretty House",
  region: "England"
};

export const PRIVATE_BO_INDIVIDUAL_MOCK = {
  dateBecameRegistrable: "2023-04-13 00:00:00.0",
  isServiceAddressSameAsUsualAddress: "N",
  dateOfBirth: "2023-04-13 00:00:00.0",
  usualResidentialAddress: PRIVATE_BO_ADDRESS,
  hashedId: "111"
};

export const PRIVATE_BO_CORPORATE_MOCK = {
  dateBecameRegistrable: "2023-04-13 00:00:00.0",
  isServiceAddressSameAsUsualAddress: "N",
  principalAddress: PRIVATE_BO_ADDRESS,
  hashedId: "222"
};

export const PRIVATE_BO_GOV_MOCK = {
  dateBecameRegistrable: "2023-04-13 00:00:00.0",
  isServiceAddressSameAsUsualAddress: "N",
  principalAddress: PRIVATE_BO_ADDRESS,
  hashedId: "333"
};

export const PRIVATE_BO_DATA_MOCK: BeneficialOwnerPrivateData[] = [
  PRIVATE_BO_INDIVIDUAL_MOCK,
  PRIVATE_BO_CORPORATE_MOCK,
  PRIVATE_BO_GOV_MOCK,
];
