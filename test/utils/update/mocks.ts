import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

export const companyDetailsMock: CompanyProfile = {
  companyName: "acme",
  companyNumber: "12345",
  companyStatus: "trading",
  jurisdiction: "Australia",
  companyStatusDetail: '',
  dateOfCreation: '1/1/2000',
  sicCodes: [],
  hasBeenLiquidated: false,
  type: 'Ltd',
  hasCharges: false,
  hasInsolvencyHistory: false,
  registeredOfficeAddress: {
    addressLineOne: "1",
    addressLineTwo: "Victoria Park",
    careOf: "",
    country: "",
    locality: "",
    poBox: "",
    premises: "",
    postalCode: "",
    region: ""
  },
  serviceAddress: {
    addressLineOne: "100 Boulevard",
    addressLineTwo: "of life",
    careOf: "",
    country: "",
    locality: "",
    poBox: "",
    premises: "",
    postalCode: "",
    region: ""
  },
  accounts: {
    nextAccounts: {
      periodEndOn: "end",
      periodStartOn: "start"
    },
    nextDue: "due",
    overdue: false
  },
  links: {}
};

export const managingOfficerMock: CompanyOfficer = {
  address: {
    premises: "1 Acme Road",
    addressLine1: "addressLine1",
    addressLine2: "addressLine2",
    locality: "locality",
    careOf: "careOf",
    poBox: "pobox",
    postalCode: "BY 2",
    region: "region",
    country: "country"
  },
  appointedOn: "appointed",
  countryOfResidence: "country1",
  dateOfBirth: {
    day: "1",
    month: "2",
    year: "1900"
  },
  formerNames: [ { forenames: "Jimmothy James", surname: "Jimminny" }, { forenames: "Finn", surname: "McCumhaill" }, { forenames: "Test", surname: "Tester" } ],
  identification: {
    legalForm: "all forms",
    legalAuthority: "country2",
    identificationType: "identification type",
    placeRegistered: "place",
    registrationNumber: "0000"
  },
  links: {
    officer: {
      appointments: ""
    }
  },
  name: "Jimmy John Wabb",
  nationality: "country1",
  occupation: "occupation",
  officerRole: "role",
  resignedOn: "resigned"
};
