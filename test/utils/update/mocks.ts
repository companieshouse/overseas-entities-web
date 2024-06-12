import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { CompanyPersonWithSignificantControl } from '@companieshouse/api-sdk-node/dist/services/company-psc/types';
import { CompanyOfficer } from '@companieshouse/api-sdk-node/dist/services/company-officers/types';
import { TrustData, IndividualTrusteeData, CorporateTrusteeData } from '@companieshouse/api-sdk-node/dist/services/overseas-entities/types';
import { RoleWithinTrustType } from '../../../src/model/role.within.trust.type.model';

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
    hashedTrustId: "12345678",
    trustName: "Test Trust",
    creationDate: "2020-01-01",
    trustStillInvolvedInOverseasEntityIndicator: "1",
    unableToObtainAllTrustInfoIndicator: false
  },
  {
    hashedTrustId: "87654321",
    trustName: "Test Trust 2",
    creationDate: "2020-02-02",
    trustStillInvolvedInOverseasEntityIndicator: "0",
    unableToObtainAllTrustInfoIndicator: true
  }
];

export const FETCH_TRUST_DATA_MOCK_WITHOUT_CHIPS_REFERENCE: TrustData =
  {
    hashedTrustId: "",
    trustName: "Test Trust",
    creationDate: "2020-01-01",
    trustStillInvolvedInOverseasEntityIndicator: "1",
    unableToObtainAllTrustInfoIndicator: false
  };

export const FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK: IndividualTrusteeData[] = [
  {
    hashedTrusteeId: "12345678",
    trusteeForename1: "Test Individual Trustee",
    trusteeForename2: "Individual",
    trusteeSurname: "Jones",
    dateOfBirth: "1990-01-01",
    nationality: "British, Irish",
    corporateIndicator: "N",
    trusteeTypeId: "5002",
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
    hashedTrusteeId: "87654321",
    trusteeForename1: "Test Individual Trustee 2",
    trusteeForename2: "Sue",
    trusteeSurname: "Smith",
    corporateIndicator: "N",
    dateOfBirth: "1950-01-01",
    appointmentDate: "2020-02-02",
    ceasedDate: "2020-03-03",
    trusteeTypeId: "5001"
  },
  {
    hashedTrusteeId: "abscdefg",
    trusteeForename1: "Test Individual Trustee 3",
    trusteeSurname: "Smith",
    dateOfBirth: "1988-12-01",
    nationality: "German",
    corporateIndicator: "N",
    trusteeTypeId: "5002",
    appointmentDate: "2022-01-01",
    usualResidentialAddress: {
      addressLine1: "Park lane",
      careOf: "Doorkeeper",
      country: "UNITED STATES",
      locality: "San Francisco",
      poBox: "8439",
      premises: "1A",
      postalCode: "12345",
      region: "California"
    }
  },
];

export const FETCH_CORPORATE_TRUSTEE_DATA_MOCK: CorporateTrusteeData[] = [
  {
    hashedTrusteeId: "12345678",
    trusteeName: "Test Corporate Trustee",
    corporateIndicator: "Y",
    trusteeTypeId: "5003",
    appointmentDate: "2020-01-01",
    onRegisterInCountryFormed: "1",
    registerLocation: "UNITED STATES",
    registrationNumber: "1234567890",
    lawGoverned: "Sheriff",
    legalForm: "The Wild West",
    country: "UNITED STATES",
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
    hashedTrusteeId: "87654321",
    trusteeName: "Test Corporate Trustee 2",
    corporateIndicator: "Y",
    appointmentDate: "2020-02-02",
    ceasedDate: "2020-03-03",
    trusteeTypeId: "5001"
  },
  {
    hashedTrusteeId: "abcdefg",
    trusteeName: "Test Corporate Trustee 3",
    corporateIndicator: "Y",
    trusteeTypeId: "5004",
    appointmentDate: "2023-3-03",
    onRegisterInCountryFormed: "0",
    lawGoverned: "Sheriff",
    legalForm: "The Wild West",
    country: "UNITED STATES",
    registeredOfficeAddress: {
      addressLine1: "Broadway",
      careOf: "",
      country: "UNITED STATES",
      locality: "Manhattan",
      poBox: "",
      premises: "10",
      postalCode: "97453874",
      region: "New York"
    },
  },
  {
    hashedTrusteeId: "abcdefg",
    trusteeName: "Test Corporate Trustee 4",
    corporateIndicator: "Y",
    trusteeTypeId: "5005",
    appointmentDate: "1990-4-30",
    onRegisterInCountryFormed: "0",
    lawGoverned: "Sheriff",
    legalForm: "The Wild West",
    country: "UNITED STATES",
    registeredOfficeAddress: {
      addressLine1: "Broadway",
      careOf: "",
      country: "UNITED STATES",
      locality: "Manhattan",
      poBox: "",
      premises: "10",
      postalCode: "97453874",
      region: "New York"
    }
  }
];

export const MAPPED_FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK =
  {
    "id": "1",
    "ch_references": "12345678",
    "dob_day": "1",
    "dob_month": "1",
    "dob_year": "1990",
    "forename": "Test Individual Trustee",
    "nationality": "British",
    "other_forenames": "Individual",
    "sa_address_care_of": "",
    "sa_address_country": "Mexico",
    "sa_address_line_1": "Boulevard",
    "sa_address_line_2": "of life",
    "sa_address_locality": "Chicoloapan",
    "sa_address_po_box": "",
    "sa_address_postal_code": "56335",
    "sa_address_premises": "100",
    "sa_address_region": "Sierra Madre",
    "second_nationality": "Irish",
    "surname": "Jones",
    "type": RoleWithinTrustType.BENEFICIARY,
    "ura_address_care_of": "",
    "ura_address_country": "Honk Kong",
    "ura_address_line_1": "Pak Hok Ting St",
    "ura_address_line_2": "",
    "ura_address_locality": "Sha Tin",
    "ura_address_po_box": "",
    "ura_address_postal_code": "12345",
    "ura_address_premises": "8",
    "ura_address_region": "Shing Mun"
  };

export const MAPPED_FETCH_SECOND_INDIVIDUAL_TRUSTEE_DATA_MOCK =
  {
    "id": "2",
    "ch_references": "abscdefg",
    "dob_day": "1",
    "dob_month": "12",
    "dob_year": "1988",
    "forename": "Test Individual Trustee 3",
    "nationality": "German",
    "other_forenames": "",
    "sa_address_care_of": "",
    "sa_address_country": "",
    "sa_address_line_1": "",
    "sa_address_line_2": "",
    "sa_address_locality": "",
    "sa_address_po_box": "",
    "sa_address_postal_code": "",
    "sa_address_premises": "",
    "sa_address_region": "",
    "second_nationality": undefined,
    "surname": "Smith",
    "type": "Beneficiary",
    "ura_address_care_of": "Doorkeeper",
    "ura_address_country": "United States",
    "ura_address_line_1": "Park lane",
    "ura_address_line_2": "",
    "ura_address_locality": "San Francisco",
    "ura_address_po_box": "8439",
    "ura_address_postal_code": "12345",
    "ura_address_premises": "1A",
    "ura_address_region": "California"
  };

export const MAPPED_FETCH_HISTORICAL_INDIVIDUAL_DATA_MOCK =
  {
    "id": "1",
    "ceased_date_day": "3",
    "ceased_date_month": "3",
    "ceased_date_year": "2020",
    "ch_references": "87654321",
    "corporate_indicator": 0,
    "forename": "Test Individual Trustee 2",
    "notified_date_day": "2",
    "notified_date_month": "2",
    "notified_date_year": "2020",
    "other_forenames": "Sue",
    "surname": "Smith",
  };

export const MAPPED_FETCH_CORPORATE_TRUSTEE_DATA_MOCK =
  {
    "id": "1",
    "ch_references": "12345678",
    "date_became_interested_person_day": "1",
    "date_became_interested_person_month": "1",
    "date_became_interested_person_year": "2020",
    "identification_country_registration": "UNITED STATES",
    "identification_legal_authority": "Sheriff",
    "identification_legal_form": "The Wild West",
    "identification_place_registered": "UNITED STATES",
    "identification_registration_number": "1234567890",
    "is_on_register_in_country_formed_in": 1,
    "is_service_address_same_as_principal_address": 0,
    "name": "Test Corporate Trustee",
    "ro_address_care_of": "",
    "ro_address_country": "Australia",
    "ro_address_line_1": "Brynat St",
    "ro_address_line_2": "",
    "ro_address_locality": "Syndney",
    "ro_address_po_box": "",
    "ro_address_postal_code": "67890",
    "ro_address_premises": "8",
    "ro_address_region": "Bayside",
    "sa_address_care_of": "",
    "sa_address_country": "Indonesia",
    "sa_address_line_1": "Jalan Melon",
    "sa_address_line_2": "",
    "sa_address_locality": "Kota Tangerang",
    "sa_address_po_box": "",
    "sa_address_postal_code": "abcd",
    "sa_address_premises": "2",
    "sa_address_region": "Banten",
    "type": RoleWithinTrustType.SETTLOR
  };

export const MAPPED_FETCH_SECOND_CORPORATE_TRUSTEE_DATA_MOCK =
  {
    "ch_references": "abcdefg",
    "date_became_interested_person_day": "3",
    "date_became_interested_person_month": "3",
    "date_became_interested_person_year": "2023",
    "id": "2",
    "identification_country_registration": "UNITED STATES",
    "identification_legal_authority": "Sheriff",
    "identification_legal_form": "The Wild West",
    "identification_place_registered": "",
    "identification_registration_number": "",
    "is_on_register_in_country_formed_in": 1,
    "is_service_address_same_as_principal_address": 0,
    "name": "Test Corporate Trustee 3",
    "ro_address_care_of": "",
    "ro_address_country": "United States",
    "ro_address_line_1": "Broadway",
    "ro_address_line_2": "",
    "ro_address_locality": "Manhattan",
    "ro_address_po_box": "",
    "ro_address_postal_code": "97453874",
    "ro_address_premises": "10",
    "ro_address_region": "New York",
    "sa_address_care_of": "",
    "sa_address_country": "",
    "sa_address_line_1": "",
    "sa_address_line_2": "",
    "sa_address_locality": "",
    "sa_address_po_box": "",
    "sa_address_postal_code": "",
    "sa_address_premises": "",
    "sa_address_region": "",
    "type": "Grantor"
  };

export const MAPPED_FETCH_THIRD_CORPORATE_TRUSTEE_DATA_MOCK =
  {
    "ch_references": "abcdefg",
    "date_became_interested_person_day": "30",
    "date_became_interested_person_month": "4",
    "date_became_interested_person_year": "1990",
    "id": "3",
    "identification_country_registration": "UNITED STATES",
    "identification_legal_authority": "Sheriff",
    "identification_legal_form": "The Wild West",
    "identification_place_registered": "",
    "identification_registration_number": "",
    "is_on_register_in_country_formed_in": 1,
    "is_service_address_same_as_principal_address": 0,
    "name": "Test Corporate Trustee 4",
    "ro_address_care_of": "",
    "ro_address_country": "United States",
    "ro_address_line_1": "Broadway",
    "ro_address_line_2": "",
    "ro_address_locality": "Manhattan",
    "ro_address_po_box": "",
    "ro_address_postal_code": "97453874",
    "ro_address_premises": "10",
    "ro_address_region": "New York",
    "sa_address_care_of": "",
    "sa_address_country": "",
    "sa_address_line_1": "",
    "sa_address_line_2": "",
    "sa_address_locality": "",
    "sa_address_po_box": "",
    "sa_address_postal_code": "",
    "sa_address_premises": "",
    "sa_address_region": "",
    "type": "Interested_Person",
  };

export const MAPPED_FETCH_HISTORICAL_CORPORATE_DATA_MOCK =
  {
    "id": "1",
    "ceased_date_day": "3",
    "ceased_date_month": "3",
    "ceased_date_year": "2020",
    "ch_references": "87654321",
    "corporate_indicator": 1,
    "corporate_name": "Test Corporate Trustee 2",
    "notified_date_day": "2",
    "notified_date_month": "2",
    "notified_date_year": "2020"
  };

export const TRUST_LINKS_DATA_MOCK = [
  {
    hashedTrustId: FETCH_TRUST_DATA_MOCK[0].hashedTrustId,
    hashedCorporateBodyAppointmentId: "bolink100"
  },
  {
    hashedTrustId: FETCH_TRUST_DATA_MOCK[1].hashedTrustId,
    hashedCorporateBodyAppointmentId: "bolink100"
  },
  {
    hashedTrustId: FETCH_TRUST_DATA_MOCK[1].hashedTrustId,
    hashedCorporateBodyAppointmentId: "bolink300"
  },
];

export const BO_TRUST_LINKS_DATA_MOCK = [
  {
    id: "bo1",
    ch_reference: "bolink100"
  },
  {
    id: "bo2",
    ch_reference: "bolink200",
    trust_ids: []
  },
  {
    id: "bo3",
    ch_reference: "bolink300",
    trust_ids: []
  }
];
