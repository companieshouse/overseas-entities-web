import { CompanyPersonWithSignificantControl } from '@companieshouse/api-sdk-node/dist/services/company-psc/types';
import { NatureOfControlType, yesNoResponse } from '../../../src/model/data.types.model';
import { mapCorporateOrGovernmentBOPrivateData, mapIndividualBOPrivateData, mapPscToBeneficialOwnerGov, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerTypeIndividual } from '../../../src/utils/update/psc.to.beneficial.owner.type.mapper';
import { BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF, BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF_NO_RESIDENTIAL, PRIVATE_BENEFICAL_OWNERS_MOCK_DATA, PRIVATE_BO_CORP_MOCK_DATA_CH_REFERENCE, PRIVATE_BO_GOV_MOCK_DATA_CH_REFERENCE, PRIVATE_BO_INDIVIDUAL_MOCK_DATA_CH_REFERENCE, PSC_BENEFICIAL_OWNER_MOCK_DATA, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK, UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK } from '../../__mocks__/session.mock';
import { pscDualNationalityMock, pscMock } from './mocks';

describe("Run all tests", () => {

  describe("Test Mapping person of significant control to beneficial owner type", () => {

    test(`That person of significant control data is mapped correctly to beneficial owner individual`, () => {
      expect(mapPscToBeneficialOwnerTypeIndividual(PSC_BENEFICIAL_OWNER_MOCK_DATA)).resolves;
    });

    test(`That person of significant control data is mapped correctly to beneficial owner other`, () => {
      expect(mapPscToBeneficialOwnerOther(PSC_BENEFICIAL_OWNER_MOCK_DATA)).resolves;
    });

    test(`That person of significant control data is mapped correctly to beneficial owner gov`, () => {
      expect(mapPscToBeneficialOwnerGov(PSC_BENEFICIAL_OWNER_MOCK_DATA)).resolves;
    });

    test(`error is thrown when undefined data is parsed to beneficial owner individual data mapper`, () => {
      expect(mapPscToBeneficialOwnerTypeIndividual({} as CompanyPersonWithSignificantControl)).toThrowError;
    });

    test(`error is thrown when undefined data is parsed to beneficial owner coperate data mapper`, () => {
      expect(mapPscToBeneficialOwnerGov({} as CompanyPersonWithSignificantControl)).toThrowError;
    });

    test(`error is thrown when undefined data is parsed to beneficial owner other data mapper`, () => {
      expect(mapPscToBeneficialOwnerOther({} as CompanyPersonWithSignificantControl)).toThrowError;
    });

    test('map person of significant control to beneficial owner individual should return object', () => {
      expect(mapPscToBeneficialOwnerTypeIndividual(pscMock)).toEqual({
        id: "company/OE111129/persons-of-significant-control/dhjsabcdjhvdjhdf",
        ch_reference: "dhjsabcdjhvdjhdf",
        date_of_birth: {
          day: pscMock.dateOfBirth.day,
          month: pscMock.dateOfBirth.month,
          year: pscMock.dateOfBirth.year
        },
        first_name: pscMock.nameElements.forename,
        last_name: pscMock.nameElements.surname,
        nationality: pscMock.nationality,
        second_nationality: undefined,
        start_date: {
          "day": "6",
          "month": "4",
          "year": "2016",
        },
        non_legal_firm_members_nature_of_control_types: [
          NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
          NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS
        ],
        trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
        beneficial_owner_nature_of_control_types: [
          NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
          NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS
        ],
        non_legal_firm_control_nature_of_control_types: [
          "OVER_25_PERCENT_OF_SHARES",
          "OVER_25_PERCENT_OF_VOTING_RIGHTS",
          "APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS",
          "SIGNIFICANT_INFLUENCE_OR_CONTROL",
        ],
        trust_control_nature_of_control_types: [
          "OVER_25_PERCENT_OF_SHARES",
          "OVER_25_PERCENT_OF_VOTING_RIGHTS",
          "APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS",
          "SIGNIFICANT_INFLUENCE_OR_CONTROL",
        ],
        owner_of_land_person_nature_of_control_jurisdictions: [
          "ENGLAND_AND_WALES",
          "SCOTLAND",
          "NORTHERN_IRELAND"
        ],
        owner_of_land_other_entity_nature_of_control_jurisdictions: [
          "ENGLAND_AND_WALES",
          "SCOTLAND",
          "NORTHERN_IRELAND",
        ],
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        service_address: {
          line_1: pscMock.address.addressLine1,
          line_2: pscMock.address.addressLine2,
          postcode: pscMock.address.postalCode,
          property_name_number: pscMock.address.premises,
          town: pscMock.address.locality,
          country: pscMock.address.country,
          county: pscMock.address.county
        },
        usual_residential_address: undefined,
        is_on_sanctions_list: pscMock.isSanctioned ? 1 : 0
      });
    });

    test('map person of significant control to beneficial owner individual with dual nationalities should return object', () => {
      expect(mapPscToBeneficialOwnerTypeIndividual(pscDualNationalityMock)).toEqual({
        id: "company/OE111129/persons-of-significant-control/dhjsabcdjhvdjhdf",
        ch_reference: "dhjsabcdjhvdjhdf",
        date_of_birth: {
          day: pscMock.dateOfBirth.day,
          month: pscMock.dateOfBirth.month,
          year: pscMock.dateOfBirth.year
        },
        first_name: pscMock.nameElements.forename,
        last_name: pscMock.nameElements.surname,
        nationality: "British",
        second_nationality: "Italian",
        start_date: {
          "day": "6",
          "month": "4",
          "year": "2016",
        },
        non_legal_firm_members_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
        trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
        beneficial_owner_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
        non_legal_firm_control_nature_of_control_types: [],
        trust_control_nature_of_control_types: [],
        owner_of_land_person_nature_of_control_jurisdictions: [],
        owner_of_land_other_entity_nature_of_control_jurisdictions: [],
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        service_address: {
          line_1: pscMock.address.addressLine1,
          line_2: pscMock.address.addressLine2,
          postcode: pscMock.address.postalCode,
          property_name_number: pscMock.address.premises,
          town: pscMock.address.locality,
          country: pscMock.address.country,
          county: pscMock.address.county
        },
        usual_residential_address: undefined,
        is_on_sanctions_list: pscMock.isSanctioned ? 1 : 0
      });
    });

    test('map person of significant control to beneficial owner other should return object', () => {
      expect(mapPscToBeneficialOwnerOther(pscMock)).toEqual({
        id: "company/OE111129/persons-of-significant-control/dhjsabcdjhvdjhdf",
        ch_reference: "dhjsabcdjhvdjhdf",
        name: pscMock.name,
        start_date: {
          "day": "6",
          "month": "4",
          "year": "2016",
        },
        non_legal_firm_members_nature_of_control_types: [
          NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
          NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS
        ],
        trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
        beneficial_owner_nature_of_control_types: [
          NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
          NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS
        ],
        non_legal_firm_control_nature_of_control_types: [
          "OVER_25_PERCENT_OF_SHARES",
          "OVER_25_PERCENT_OF_VOTING_RIGHTS",
          "APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS",
          "SIGNIFICANT_INFLUENCE_OR_CONTROL",
        ],
        trust_control_nature_of_control_types: [
          "OVER_25_PERCENT_OF_SHARES",
          "OVER_25_PERCENT_OF_VOTING_RIGHTS",
          "APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS",
          "SIGNIFICANT_INFLUENCE_OR_CONTROL",
        ],
        owner_of_land_person_nature_of_control_jurisdictions: [
          "ENGLAND_AND_WALES",
          "SCOTLAND",
          "NORTHERN_IRELAND"
        ],
        owner_of_land_other_entity_nature_of_control_jurisdictions: [
          "ENGLAND_AND_WALES",
          "SCOTLAND",
          "NORTHERN_IRELAND",
        ],
        is_service_address_same_as_principal_address: undefined,
        service_address: {
          line_1: pscMock.address.addressLine1,
          line_2: pscMock.address.addressLine2,
          postcode: pscMock.address.postalCode,
          property_name_number: pscMock.address.premises,
          town: pscMock.address.locality,
          country: pscMock.address.country,
          county: undefined
        },
        principal_address: undefined,
        law_governed: pscMock.identification?.legalAuthority,
        legal_form: pscMock.identification?.legalForm,
        public_register_name: pscMock.identification?.placeRegistered,
        registration_number: pscMock.identification?.registrationNumber,
        is_on_register_in_country_formed_in: pscMock.identification && pscMock.identification.registrationNumber ? 1 : 0,
        is_on_sanctions_list: pscMock.isSanctioned ? 1 : 0
      });
    });

    test('map person of significant control to beneficial owner corporate (gov) should return object', () => {
      expect(mapPscToBeneficialOwnerGov(pscMock)).toEqual({
        id: "company/OE111129/persons-of-significant-control/dhjsabcdjhvdjhdf",
        ch_reference: "dhjsabcdjhvdjhdf",
        name: pscMock.name,
        start_date: {
          "day": "6",
          "month": "4",
          "year": "2016",
        },
        non_legal_firm_members_nature_of_control_types: [
          NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
          NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS
        ],
        beneficial_owner_nature_of_control_types: [
          NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
          NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS
        ],
        non_legal_firm_control_nature_of_control_types: [
          "OVER_25_PERCENT_OF_SHARES",
          "OVER_25_PERCENT_OF_VOTING_RIGHTS",
          "APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS",
          "SIGNIFICANT_INFLUENCE_OR_CONTROL",
        ],
        trust_control_nature_of_control_types: [
          "OVER_25_PERCENT_OF_SHARES",
          "OVER_25_PERCENT_OF_VOTING_RIGHTS",
          "APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS",
          "SIGNIFICANT_INFLUENCE_OR_CONTROL",
        ],
        owner_of_land_person_nature_of_control_jurisdictions: [
          "ENGLAND_AND_WALES",
          "SCOTLAND",
          "NORTHERN_IRELAND"
        ],
        owner_of_land_other_entity_nature_of_control_jurisdictions: [
          "ENGLAND_AND_WALES",
          "SCOTLAND",
          "NORTHERN_IRELAND",
        ],
        is_service_address_same_as_principal_address: undefined,
        service_address: {
          line_1: pscMock.address.addressLine1,
          line_2: pscMock.address.addressLine2,
          postcode: pscMock.address.postalCode,
          property_name_number: pscMock.address.premises,
          town: pscMock.address.locality,
          country: pscMock.address.country,
        },
        principal_address: undefined,
        law_governed: pscMock.identification?.legalAuthority,
        legal_form: pscMock.identification?.legalForm,
        is_on_sanctions_list: pscMock.isSanctioned ? 1 : 0
      });
    });

    test('that no error is thrown if nature of control type does not match', () => {
      pscMock.naturesOfControl = ['Some unknown 25% share'];
      const bo = mapPscToBeneficialOwnerOther(pscMock);
      expect(bo.trustees_nature_of_control_types).toEqual([]);
      expect(bo.beneficial_owner_nature_of_control_types).toEqual([]);
      expect(bo.non_legal_firm_members_nature_of_control_types).toEqual([]);
      expect(bo.non_legal_firm_control_nature_of_control_types).toEqual([]);
      expect(bo.trust_control_nature_of_control_types).toEqual([]);
      expect(bo.owner_of_land_person_nature_of_control_jurisdictions).toEqual([]);
      expect(bo.owner_of_land_other_entity_nature_of_control_jurisdictions).toEqual([]);
    });

    test('that error is empty pcsc nature of control', () => {
      pscMock.naturesOfControl = [];
      expect(mapPscToBeneficialOwnerOther(pscMock)).toBeUndefined;
    });
  });

  describe("Private address and Date of Birth retrieval for Beneficial Owners", () => {
    const mappedBoAddress = {
      property_name_number: "REAGAN HICKMAN",
      line_1: "72 COWLEY AVENUE",
      line_2: "QUIA EX ESSE SINT EU",
      county: "ULLAM DOLORUM CUPIDA",
      country: "Kuwait",
      postcode: "76022",
      town: "AD EUM DEBITIS EST E"
    };

    test('private data for Individual Beneficial Owner is correctly mapped', () => {
      const appDataIndividualBoWithMatchingChRef = {
        ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
        ch_reference: PRIVATE_BO_INDIVIDUAL_MOCK_DATA_CH_REFERENCE
      };
      mapIndividualBOPrivateData(PRIVATE_BENEFICAL_OWNERS_MOCK_DATA, appDataIndividualBoWithMatchingChRef);
      expect(appDataIndividualBoWithMatchingChRef.usual_residential_address).toEqual(mappedBoAddress);
      expect(appDataIndividualBoWithMatchingChRef.date_of_birth).toEqual({ day: "19", month: "4", year: "1979" });
      expect(appDataIndividualBoWithMatchingChRef.have_day_of_birth).toEqual(true);
    });

    test('principal/office address for beneficial owner gov is correctly mapped', () => {
      const appDataGovBoWithMatchingChRef = {
        ...BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF,
        ch_reference: PRIVATE_BO_GOV_MOCK_DATA_CH_REFERENCE
      };
      mapCorporateOrGovernmentBOPrivateData(PRIVATE_BENEFICAL_OWNERS_MOCK_DATA, appDataGovBoWithMatchingChRef);
      expect(appDataGovBoWithMatchingChRef.principal_address).toEqual(mappedBoAddress);
    });

    test('principal/office address for Corporate/Other Beneficial Owner is correctly mapped', () => {
      const appDataCorpBoWithMatchingChRef = {
        ...UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
        ch_reference: PRIVATE_BO_CORP_MOCK_DATA_CH_REFERENCE
      };
      mapCorporateOrGovernmentBOPrivateData(PRIVATE_BENEFICAL_OWNERS_MOCK_DATA, appDataCorpBoWithMatchingChRef);
      expect(appDataCorpBoWithMatchingChRef.principal_address).toEqual(mappedBoAddress);
    });

    test('private data for Individual Beneficial Owner is not mapped if no matching hashedId', () => {
      const appDataIndividualBoWithMatchingChRef = {
        ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF_NO_RESIDENTIAL,
        ch_reference: 'some_other_ch_ref'
      };
      mapIndividualBOPrivateData(PRIVATE_BENEFICAL_OWNERS_MOCK_DATA, appDataIndividualBoWithMatchingChRef);
      expect(appDataIndividualBoWithMatchingChRef.usual_residential_address).not.toEqual(mappedBoAddress);
      expect(appDataIndividualBoWithMatchingChRef.have_day_of_birth).toBeUndefined();
    });

    test('principal/office address for Gov and Corp BOs is not mapped when no matching hashedId', () => {
      const appDataGovBoWithMatchingChRef = {
        ...BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF,
        ch_reference: 'some_other_ch_ref'
      };
      mapCorporateOrGovernmentBOPrivateData(PRIVATE_BENEFICAL_OWNERS_MOCK_DATA, appDataGovBoWithMatchingChRef);
      expect(appDataGovBoWithMatchingChRef.principal_address).not.toEqual(mappedBoAddress);
    });
  });
});
