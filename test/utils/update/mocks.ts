import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { CompanyPersonWithSignificantControl } from '@companieshouse/api-sdk-node/dist/services/company-psc/types';
import { CompanyOfficer } from '@companieshouse/api-sdk-node/dist/services/company-officers/types';
import { TrustData, IndividualTrusteeData, CorporateTrusteeData } from '@companieshouse/api-sdk-node/dist/services/overseas-entities/types';

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
      country: "UNITED STATES"
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
  contactDetails: {
    contactName: "Test User"
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
  officerRole: "",
  responsibilities: "role and responsibilities text",
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
  contactDetails: {
    contactName: "Test User",
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
  officerRole: "",
  responsibilities: "role and responsibilities text",
  resignedOn: "resigned"
};

export const FETCH_TRUST_DATA_MOCK: TrustData[] = [
  {
    trustId: "12345678",
    trustName: "Test Trust",
    creationDate: "2020-01-01",
    unableToObtainAllTrustInfo: false
  },
  {
    trustId: "87654321",
    trustName: "Test Trust 2",
    creationDate: "2020-02-02",
    unableToObtainAllTrustInfo: true
  }
];

export const FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK: IndividualTrusteeData[] = [
  {
    trusteeId: "12345678",
    trusteeForename1: "Test Individual Trustee",
    trusteeForename2: "Individual",
    trusteeSurname: "Jones",
    dateOfBirth: "1990-01-01",
    nationality: "British",
    corporateIndicator: "N",
    trusteeTypeId: "50002",
    appointmentDate: "2020-01-01",
    usualResidentialAddress: {
      addressLine1: "Pak Hok Ting St",
      careOf: "",
      country: "Honk Kong",
      locality: "Sha Tin",
      poBox: "",
      premises: "8",
      postalCode: "12345",
      region: "Shing Mun"
    },
    serviceAddress: {
      addressLine1: "Boulevard",
      addressLine2: "of life",
      careOf: "",
      country: "Mexico",
      locality: "Chicoloapan",
      poBox: "",
      premises: "100",
      postalCode: "56335",
      region: "Sierra Madre"
    },
  },
  {
    trusteeId: "87654321",
    trusteeForename1: "Test Individual Trustee 2",
    trusteeSurname: "Smith",
    corporateIndicator: "N",
    appointmentDate: "2020-02-02",
    ceasedDate: "2020-03-03",
    trusteeTypeId: "50002"
  }
];

export const FETCH_CORPORATE_TRUSTEE_DATA_MOCK: CorporateTrusteeData[] = [
  {
    trusteeId: "12345678",
    trusteeName: "Test Corporate Trustee",
    corporateIndicator: "N",
    trusteeTypeId: "50002",
    appointmentDate: "2020-01-01",
    registeredOfficeAddress: {
      addressLine1: "Brynat St",
      careOf: "",
      country: "Australia",
      locality: "Syndney",
      poBox: "",
      premises: "8",
      postalCode: "67890",
      region: "Bayside"
    },
    serviceAddress: {
      addressLine1: "Jalan Melon",
      careOf: "",
      country: "Indonesia",
      locality: "Kota Tangerang",
      poBox: "",
      premises: "2",
      postalCode: "abcd",
      region: "Banten"
    },
  },
  {
    trusteeId: "87654321",
    trusteeName: "Test Corporate Trustee 2",
    corporateIndicator: "N",
    appointmentDate: "2020-02-02",
    ceasedDate: "2020-03-03",
    trusteeTypeId: "50002"
  }
];
