import { ManagingOfficerData, ManagingOfficersPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";

const INDIVIDUAL_MO_MOCK: ManagingOfficerData = {
  residentialAddress: {
    addressLine1: "URA Address line 1",
    addressLine2: "URA Address line 2",
    country: "URA Country",
    locality: "URA Town",
    postalCode: "URA Postcode",
    premises: "URA 1",
    region: "URA County"
  },
  hashedId: "officers1",
  managingOfficerAppointmentId: "",
  principalAddress: {},
  dateOfBirth: "",
  contactNameFull: "",
  contactEmailAddress: ""
};

export const MOCK_GET_MO_PRIVATE_DATA: ManagingOfficersPrivateData = {
  moPrivateData: [
    INDIVIDUAL_MO_MOCK
  ]
};
