import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { CompanyPersonWithSignificantControl } from '@companieshouse/api-sdk-node/dist/services/company-psc/types';

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
  foreignCompanyDetails: {
    registrationNumber: "1234567890",
    governedBy: "Sheriff",
    legalForm: "The Wild West",
    originatingRegistry: {
      name: "Sheriff Office",
      country: "US"
    }
  },
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

export const pscMock: CompanyPersonWithSignificantControl = {
  nameElements: {
    forename: "Random",
    surname: "Person"
  },
  name: "Mr Random Notreal Person",
  notifiedOn: "2016-04-06",
  nationality: "British",
  address: {
    region: "country1",
    postal_code: "CF14 3UZ",
    premises: "Companies House",
    locality: "Limavady",
    address_line_1: "",
    address_line_2: "",
  },
  countryOfResidence: "Wales",
  dateOfBirth: {
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
    legalAuthority: "",
    legalForm: "",
    placeRegistered: "",
    registrationNumber: ""
  },
  naturesOfControl: [
    'ownership-of-shares-more-than-25-percent-registered-overseas-entity',
    'ownership-of-shares-more-than-25-percent-as-trust-registered-overseas-entity',
    'ownership-of-shares-more-than-25-percent-as-firm-registered-overseas-entity'
  ],
  isSanctioned: true
};
