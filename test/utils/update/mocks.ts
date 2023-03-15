import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { CompanyOfficerResource } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

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

export const managingOfficerMock: CompanyOfficerResource = {
  address: {
    premises: "1 Acme Road",
    address_line_1: "addressLine1",
    address_line_2: "addressLine2",
    locality: "locality",
    care_of: "careOf",
    po_box: "pobox",
    postal_code: "BY 2",
    region: "region",
    country: "country"
  },
  appointed_on: "appointed",
  country_of_residence: "country1",
  date_of_birth: {
    day: "1",
    month: "2",
    year: "1900"
  },
  former_names: [ { forenames: "Jimmothy James", surname: "Jimminny" }, { forenames: "Finn", surname: "McCumhaill" }, { forenames: "Test", surname: "Tester" } ],
  identification: {
    legal_form: "all forms",
    legal_authority: "country2",
    identification_type: "identification type",
    place_registered: "place",
    registration_number: "0000"
  },
  links: {
    officer: {
      appointments: ""
    }
  },
  name: "Jimmy John Wabb",
  nationality: "country1",
  occupation: "occupation",
  officer_role: "role",
  resigned_on: "resigned"
};
