import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { CompanyPersonWithSignificantControlResource } from '@companieshouse/api-sdk-node/dist/services/company-psc/types';

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

export const pscMock: CompanyPersonWithSignificantControlResource = {
  name_elements: {
    forename: "Random",
    surname: "Person"
  },
  name: "Mr Random Notreal Person",
  notified_on: "2016-04-06",
  nationality: "British",
  address: {
    region: "country1",
    postal_code: "CF14 3UZ",
    premises: "Companies House",
    locality: "Limavady",
    address_line_1: "",
    address_line_2: "",
  },
  country_of_residence: "Wales",
  date_of_birth: {
    day: "1",
    month: "2",
    year: "1900"
  },
  etag: '',
  links: {
    self: "",
    statement: ""
  },
  identification: {
    legal_authority: "",
    legal_form: "",
    place_registered: "",
    registration_number: ""
  },
  natures_of_control: [
    'ownership-of-shares-more-than-25-percent-registered-overseas-entity',
    'ownership-of-shares-more-than-25-percent-as-trust-registered-overseas-entity',
    'ownership-of-shares-more-than-25-percent-as-firm-registered-overseas-entity'
  ],
  // isSanctioned: yesNoResponse.No
};
