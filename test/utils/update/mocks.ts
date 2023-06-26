import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { CompanyPersonWithSignificantControl } from '@companieshouse/api-sdk-node/dist/services/company-psc/types';
import { CompanyOfficer } from '@companieshouse/api-sdk-node/dist/services/company-officers/types';

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
    country: "country1",
    postalCode: "CF14 3UZ",
    premises: "Companies House",
    locality: "Limavady",
    addressLine1: "",
    addressLine2: "",
  },
  countryOfResidence: "Wales",
  dateOfBirth: {
    day: "1",
    month: "02",
    year: "1900"
  },
  etag: '',
  links: {
    self: "company/OE111129/persons-of-significant-control/dhjsabcdjhvdjhdf",
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
    'ownership-of-shares-more-than-25-percent-as-firm-registered-overseas-entity',
    'right-to-appoint-and-remove-directors-as-firm-registered-overseas-entity',
    'right-to-appoint-and-remove-directors-registered-overseas-entity',
  ],
  isSanctioned: true,
};

export const pscDualNationalityMock: CompanyPersonWithSignificantControl = {
  nameElements: {
    forename: "Random",
    surname: "Person"
  },
  name: "Mr Random Notreal Person",
  notifiedOn: "2016-04-06",
  nationality: "British, Italian",
  address: {
    country: "country1",
    postalCode: "CF14 3UZ",
    premises: "Companies House",
    locality: "Limavady",
    addressLine1: "",
    addressLine2: "",
  },
  countryOfResidence: "Wales",
  dateOfBirth: {
    day: "1",
    month: "2",
    year: "1900"
  },
  etag: '',
  links: {
    self: "company/OE111129/persons-of-significant-control/dhjsabcdjhvdjhdf",
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
  isSanctioned: true,
};

export const managingOfficerMock: CompanyOfficer = {
  address: {
    premises: "1",
    addressLine1: "addressLine1",
    addressLine2: "addressLine2",
    locality: "town",
    careOf: "careOf",
    poBox: "pobox",
    postalCode: "BY 2",
    region: "county",
    country: "country"
  },
  appointedOn: "2023-04-01",
  countryOfResidence: "country1",
  dateOfBirth: {
    day: "1",
    month: "02",
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
    self: "selfLink",
    officer: {
      appointments: ""
    }
  },
  name: "Wabb, Jimmy John",
  nationality: "country1",
  occupation: "occupation",
  officerRole: "role",
  resignedOn: "resigned"
};

export const managingOfficerMockDualNationality: CompanyOfficer = {
  address: {
    premises: "1",
    addressLine1: "addressLine1",
    addressLine2: "addressLine2",
    locality: "town",
    careOf: "careOf",
    poBox: "pobox",
    postalCode: "BY 2",
    region: "county",
    country: "country"
  },
  appointedOn: "2023-04-01",
  countryOfResidence: "country1",
  dateOfBirth: {
    day: "1",
    month: "02",
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
    self: "selfLink",
    officer: {
      appointments: ""
    }
  },
  name: "Wabb, Jimmy John",
  nationality: "country1, country2",
  occupation: "occupation",
  officerRole: "role",
  resignedOn: "resigned"
};
