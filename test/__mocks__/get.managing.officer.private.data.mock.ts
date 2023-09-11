import { ManagingOfficerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";

export const INDIVIDUAL_MO_MOCK: ManagingOfficerPrivateData[] = [
  {
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
  }
];

