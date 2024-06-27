jest.mock('uuid');

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { ApplicationData } from "../../../src/model";
import * as uuid from 'uuid';
import { TrustLegalEntityForm } from '../../../src/model/trust.page.model';
import { TrustCorporate, TrustKey } from "../../../src/model/trust.model";
import { TrusteeType } from "../../../src/model/trustee.type.model";
import { RoleWithinTrustType } from "../../../src/model/role.within.trust.type.model";
import {
  generateId,
  mapLegalEntityItemToPage,
  mapLegalEntityToSession,
  mapLegalEntityTrusteeByIdFromSessionToPage,
} from '../../../src/utils/trust/legal.entity.beneficial.owner.mapper';
import { yesNoResponse } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";

describe('Trust Legal Entity Beneficial Owner Page Mapper Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test session mapper methods', () => {
    describe('Test trust legal entity form to session mapping', () => {
      const mockFormDataBasic = {
        legalEntityId: "9999",
        legalEntityName: "My Legal Entity",
        principal_address_property_name_number: "99",
        principal_address_line_1: "Reg Office First Line",
        principal_address_line_2: "Reg Office Second Line",
        principal_address_town: "Reg Office Town",
        principal_address_country: "Reg Office Country",
        principal_address_county: "Reg Office County",
        principal_address_postcode: "Reg Office Postcode",
        service_address_property_name_number: "100",
        service_address_line_1: "Serv First Line",
        service_address_line_2: "Serv Second Line",
        service_address_town: "Serv Town",
        service_address_county: "Serv County",
        service_address_country: "Serv Country",
        service_address_postcode: "Serv Postcode",
        legalForm: "Legal Form",
        governingLaw: "Governing Law",
        public_register_name: "Reg Name",
        public_register_jurisdiction: "Reg Jurisdiction",
        registration_number: "9001",
        interestedPersonStartDateDay: "01",
        interestedPersonStartDateMonth: "01",
        interestedPersonStartDateYear: "2024",
        ceasedDateDay: "02",
        ceasedDateMonth: "01",
        ceasedDateYear: "2024",
        stillInvolved: "0",
      };

      test('Map legal entity trustee to session with different service address and not on public reg', () => {

        const mockFormData = {
          ...mockFormDataBasic,
          roleWithinTrust: RoleWithinTrustType.BENEFICIARY,
          is_service_address_same_as_principal_address: yesNoResponse.No,
          is_on_register_in_country_formed_in: yesNoResponse.No
        };

        expect(mapLegalEntityToSession(mockFormData as TrustLegalEntityForm)).toEqual({
          id: mockFormData.legalEntityId,
          type: mockFormData.roleWithinTrust,
          name: mockFormData.legalEntityName,
          date_became_interested_person_day: mockFormData.interestedPersonStartDateDay,
          date_became_interested_person_month: mockFormData.interestedPersonStartDateMonth,
          date_became_interested_person_year: mockFormData.interestedPersonStartDateYear,
          ro_address_premises: mockFormData.principal_address_property_name_number,
          ro_address_line_1: mockFormData.principal_address_line_1,
          ro_address_line_2: mockFormData.principal_address_line_2,
          ro_address_locality: mockFormData.principal_address_town,
          ro_address_region: mockFormData.principal_address_county,
          ro_address_country: mockFormData.principal_address_country,
          ro_address_postal_code: mockFormData.principal_address_postcode,
          ro_address_care_of: "",
          ro_address_po_box: "",
          sa_address_premises: mockFormData.service_address_property_name_number,
          sa_address_line_1: mockFormData.service_address_line_1,
          sa_address_line_2: mockFormData.service_address_line_2,
          sa_address_locality: mockFormData.service_address_town,
          sa_address_region: mockFormData.service_address_county,
          sa_address_country: mockFormData.service_address_country,
          sa_address_postal_code: mockFormData.service_address_postcode,
          sa_address_care_of: "",
          sa_address_po_box: "",
          identification_legal_authority: mockFormData.governingLaw,
          identification_legal_form: mockFormData.legalForm,
          is_service_address_same_as_principal_address: mockFormData.is_service_address_same_as_principal_address,
          is_on_register_in_country_formed_in: mockFormData.is_on_register_in_country_formed_in,
          ceased_date_day: mockFormData.ceasedDateDay,
          ceased_date_month: mockFormData.ceasedDateMonth,
          ceased_date_year: mockFormData.ceasedDateYear,
          still_involved: "No",
        });
      });

      test('Map legal entity trustee(INTERESTED_PERSON) to session without public register infomation and same service address', () => {

        const mockFormData = {
          ...mockFormDataBasic,
          roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
          interestedPersonStartDateDay: "01",
          interestedPersonStartDateMonth: "01",
          interestedPersonStartDateYear: "2020",
          is_service_address_same_as_principal_address: yesNoResponse.Yes,
          is_on_register_in_country_formed_in: yesNoResponse.Yes
        };

        expect(mapLegalEntityToSession(mockFormData as TrustLegalEntityForm)).toEqual({
          id: mockFormData.legalEntityId,
          type: mockFormData.roleWithinTrust,
          name: mockFormData.legalEntityName,
          date_became_interested_person_day: mockFormData.interestedPersonStartDateDay,
          date_became_interested_person_month: mockFormData.interestedPersonStartDateMonth,
          date_became_interested_person_year: mockFormData.interestedPersonStartDateYear,
          ro_address_premises: mockFormData.principal_address_property_name_number,
          ro_address_line_1: mockFormData.principal_address_line_1,
          ro_address_line_2: mockFormData.principal_address_line_2,
          ro_address_locality: mockFormData.principal_address_town,
          ro_address_region: mockFormData.principal_address_county,
          ro_address_country: mockFormData.principal_address_country,
          ro_address_postal_code: mockFormData.principal_address_postcode,
          ro_address_care_of: "",
          ro_address_po_box: "",
          sa_address_premises: "",
          sa_address_line_1: "",
          sa_address_line_2: "",
          sa_address_locality: "",
          sa_address_region: "",
          sa_address_country: "",
          sa_address_postal_code: "",
          sa_address_care_of: "",
          sa_address_po_box: "",
          identification_legal_authority: mockFormData.governingLaw,
          identification_legal_form: mockFormData.legalForm,
          identification_place_registered: mockFormData.public_register_name,
          identification_country_registration: mockFormData.public_register_jurisdiction,
          identification_registration_number: mockFormData.registration_number,
          is_service_address_same_as_principal_address: mockFormData.is_service_address_same_as_principal_address,
          is_on_register_in_country_formed_in: mockFormData.is_on_register_in_country_formed_in,
          ceased_date_day: mockFormData.ceasedDateDay,
          ceased_date_month: mockFormData.ceasedDateMonth,
          ceased_date_year: mockFormData.ceasedDateYear,
          still_involved: "No",
        });
      });

      test('test generateId', () => {
        const expectNewId = '9999';
        jest.spyOn(uuid, 'v4').mockReturnValue(expectNewId);

        expect(generateId()).toBe(expectNewId);
      });
    });

    describe('Test trust legal session to page mapping', () => {

      const mockSessionDataBasic = {
        id: "9998",
        name: "My Legal Entity in Session",
        ro_address_premises: "99",
        ro_address_line_1: "Reg Office First Line",
        ro_address_line_2: "Reg Office Second Line",
        ro_address_locality: "Reg Office Town",
        ro_address_region: "Reg Office County",
        ro_address_country: "Reg Office Country",
        ro_address_postal_code: "Reg Office Postcode",
        ro_address_care_of: "",
        ro_address_po_box: "",
        sa_address_premises: "100",
        sa_address_line_1: "Serv First Line",
        sa_address_line_2: "Serv Second Line",
        sa_address_locality: "Serv Town",
        sa_address_region: "Serv County",
        sa_address_country: "Serv Country",
        sa_address_postal_code: "Serv Postcode",
        sa_address_care_of: "",
        sa_address_po_box: "",
        identification_legal_form: "Legal Form",
        identification_legal_authority: "Governing Law",
        identification_place_registered: "Reg Name",
        identification_country_registration: "Reg Jurisdiction",
        identification_registration_number: "9002",
        is_service_address_same_as_principal_address: yesNoResponse.Yes,
        is_on_register_in_country_formed_in: yesNoResponse.Yes,
        ceased_date_day: "01",
        ceased_date_month: "02",
        ceased_date_year: "2020",
        still_involved: "No"
      };
      test("Map legal entity trustee session data to page", () => {

        const trustId = '987';
        const trusteeId = '9998';
        const mockSessionData = {
          ...mockSessionDataBasic,
          type: RoleWithinTrustType.BENEFICIARY
        };

        const appData = {
          [TrustKey]: [{
            'trust_id': trustId,
            'CORPORATES': [ mockSessionData ] as TrustCorporate[],
          }]
        } as ApplicationData;
        expect(
          mapLegalEntityTrusteeByIdFromSessionToPage(appData, trustId, trusteeId)
        ).toEqual({
          legalEntityId: mockSessionData.id,
          roleWithinTrust: mockSessionData.type,
          legalEntityName: mockSessionData.name,
          principal_address_property_name_number: mockSessionData.ro_address_premises,
          principal_address_line_1: mockSessionData.ro_address_line_1,
          principal_address_line_2: mockSessionData.ro_address_line_2,
          principal_address_town: mockSessionData.ro_address_locality,
          principal_address_county: mockSessionData.ro_address_region,
          principal_address_country: mockSessionData.ro_address_country,
          principal_address_postcode: mockSessionData.ro_address_postal_code,
          service_address_property_name_number: mockSessionData.sa_address_premises,
          service_address_line_1: mockSessionData.sa_address_line_1,
          service_address_line_2: mockSessionData.sa_address_line_2,
          service_address_town: mockSessionData.sa_address_locality,
          service_address_county: mockSessionData.sa_address_region,
          service_address_country: mockSessionData.sa_address_country,
          service_address_postcode: mockSessionData.sa_address_postal_code,
          governingLaw: mockSessionData.identification_legal_authority,
          legalForm: mockSessionData.identification_legal_form,
          public_register_name: mockSessionData.identification_place_registered,
          public_register_jurisdiction: mockSessionData.identification_country_registration,
          registration_number: mockSessionData.identification_registration_number,
          is_service_address_same_as_principal_address: mockSessionData.is_service_address_same_as_principal_address,
          is_on_register_in_country_formed_in: mockSessionData.is_on_register_in_country_formed_in,
          is_newly_added: true,
          ceasedDateDay: mockSessionData.ceased_date_day,
          ceasedDateMonth: mockSessionData.ceased_date_month,
          ceasedDateYear: mockSessionData.ceased_date_year,
          stillInvolved: "0"
        });
      });

      test("Map legal entity trustee session data to page(INTERESTED_PERSON)", () => {

        const trustId = '987';
        const trusteeId = '9998';

        const mockSessionData = {
          ...mockSessionDataBasic,
          type: RoleWithinTrustType.INTERESTED_PERSON,
          date_became_interested_person_day: "01",
          date_became_interested_person_month: "01",
          date_became_interested_person_year: "2020",
        };

        const appData = {
          [TrustKey]: [{
            'trust_id': trustId,
            'CORPORATES': [ mockSessionData ] as TrustCorporate[],
          }]
        } as ApplicationData;
        expect(
          mapLegalEntityTrusteeByIdFromSessionToPage(appData, trustId, trusteeId)
        ).toEqual({
          legalEntityId: mockSessionData.id,
          roleWithinTrust: mockSessionData.type,
          legalEntityName: mockSessionData.name,
          interestedPersonStartDateDay: mockSessionData.date_became_interested_person_day,
          interestedPersonStartDateMonth: mockSessionData.date_became_interested_person_month,
          interestedPersonStartDateYear: mockSessionData.date_became_interested_person_year,
          principal_address_property_name_number: mockSessionData.ro_address_premises,
          principal_address_line_1: mockSessionData.ro_address_line_1,
          principal_address_line_2: mockSessionData.ro_address_line_2,
          principal_address_town: mockSessionData.ro_address_locality,
          principal_address_county: mockSessionData.ro_address_region,
          principal_address_country: mockSessionData.ro_address_country,
          principal_address_postcode: mockSessionData.ro_address_postal_code,
          service_address_property_name_number: mockSessionData.sa_address_premises,
          service_address_line_1: mockSessionData.sa_address_line_1,
          service_address_line_2: mockSessionData.sa_address_line_2,
          service_address_town: mockSessionData.sa_address_locality,
          service_address_county: mockSessionData.sa_address_region,
          service_address_country: mockSessionData.sa_address_country,
          service_address_postcode: mockSessionData.sa_address_postal_code,
          governingLaw: mockSessionData.identification_legal_authority,
          legalForm: mockSessionData.identification_legal_form,
          public_register_name: mockSessionData.identification_place_registered,
          public_register_jurisdiction: mockSessionData.identification_country_registration,
          registration_number: mockSessionData.identification_registration_number,
          is_service_address_same_as_principal_address: mockSessionData.is_service_address_same_as_principal_address,
          is_on_register_in_country_formed_in: mockSessionData.is_on_register_in_country_formed_in,
          is_newly_added: true,
          ceasedDateDay: mockSessionData.ceased_date_day,
          ceasedDateMonth: mockSessionData.ceased_date_month,
          ceasedDateYear: mockSessionData.ceased_date_year,
          stillInvolved: "0"
        });
      });
      test("Map legal entity trustee session data to page trustee item", () => {
        expect(
          mapLegalEntityItemToPage(mockSessionDataBasic as TrustCorporate)
        ).toEqual({
          id: mockSessionDataBasic.id,
          name: mockSessionDataBasic.name,
          trusteeItemType: TrusteeType.LEGAL_ENTITY,
          is_newly_added: true,
        });
      });

      test("Test stillInvolved flag with Yes", () => {

        const trustId = '987';
        const trusteeId = '9998';

        const mockSessionData = {
          ...mockSessionDataBasic,
          still_involved: "Yes",
        };

        const appData = {
          [TrustKey]: [{
            'trust_id': trustId,
            'CORPORATES': [ mockSessionData ] as TrustCorporate[],
          }]
        } as ApplicationData;
        expect(
          mapLegalEntityTrusteeByIdFromSessionToPage(appData, trustId, trusteeId)
        ).toEqual({
          legalEntityId: mockSessionData.id,
          legalEntityName: mockSessionData.name,
          principal_address_property_name_number: mockSessionData.ro_address_premises,
          principal_address_line_1: mockSessionData.ro_address_line_1,
          principal_address_line_2: mockSessionData.ro_address_line_2,
          principal_address_town: mockSessionData.ro_address_locality,
          principal_address_county: mockSessionData.ro_address_region,
          principal_address_country: mockSessionData.ro_address_country,
          principal_address_postcode: mockSessionData.ro_address_postal_code,
          service_address_property_name_number: mockSessionData.sa_address_premises,
          service_address_line_1: mockSessionData.sa_address_line_1,
          service_address_line_2: mockSessionData.sa_address_line_2,
          service_address_town: mockSessionData.sa_address_locality,
          service_address_county: mockSessionData.sa_address_region,
          service_address_country: mockSessionData.sa_address_country,
          service_address_postcode: mockSessionData.sa_address_postal_code,
          governingLaw: mockSessionData.identification_legal_authority,
          legalForm: mockSessionData.identification_legal_form,
          public_register_name: mockSessionData.identification_place_registered,
          public_register_jurisdiction: mockSessionData.identification_country_registration,
          registration_number: mockSessionData.identification_registration_number,
          is_service_address_same_as_principal_address: mockSessionData.is_service_address_same_as_principal_address,
          is_on_register_in_country_formed_in: mockSessionData.is_on_register_in_country_formed_in,
          is_newly_added: true,
          ceasedDateDay: mockSessionData.ceased_date_day,
          ceasedDateMonth: mockSessionData.ceased_date_month,
          ceasedDateYear: mockSessionData.ceased_date_year,
          stillInvolved: "1"
        });
      });

      test("Test stillInvolved flag with No", () => {

        const trustId = '987';
        const trusteeId = '9998';

        const mockSessionData = {
          ...mockSessionDataBasic,
          still_involved: "No",
        };

        const appData = {
          [TrustKey]: [{
            'trust_id': trustId,
            'CORPORATES': [ mockSessionData ] as TrustCorporate[],
          }]
        } as ApplicationData;
        expect(
          mapLegalEntityTrusteeByIdFromSessionToPage(appData, trustId, trusteeId)
        ).toEqual({
          legalEntityId: mockSessionData.id,
          legalEntityName: mockSessionData.name,
          principal_address_property_name_number: mockSessionData.ro_address_premises,
          principal_address_line_1: mockSessionData.ro_address_line_1,
          principal_address_line_2: mockSessionData.ro_address_line_2,
          principal_address_town: mockSessionData.ro_address_locality,
          principal_address_county: mockSessionData.ro_address_region,
          principal_address_country: mockSessionData.ro_address_country,
          principal_address_postcode: mockSessionData.ro_address_postal_code,
          service_address_property_name_number: mockSessionData.sa_address_premises,
          service_address_line_1: mockSessionData.sa_address_line_1,
          service_address_line_2: mockSessionData.sa_address_line_2,
          service_address_town: mockSessionData.sa_address_locality,
          service_address_county: mockSessionData.sa_address_region,
          service_address_country: mockSessionData.sa_address_country,
          service_address_postcode: mockSessionData.sa_address_postal_code,
          governingLaw: mockSessionData.identification_legal_authority,
          legalForm: mockSessionData.identification_legal_form,
          public_register_name: mockSessionData.identification_place_registered,
          public_register_jurisdiction: mockSessionData.identification_country_registration,
          registration_number: mockSessionData.identification_registration_number,
          is_service_address_same_as_principal_address: mockSessionData.is_service_address_same_as_principal_address,
          is_on_register_in_country_formed_in: mockSessionData.is_on_register_in_country_formed_in,
          is_newly_added: true,
          ceasedDateDay: mockSessionData.ceased_date_day,
          ceasedDateMonth: mockSessionData.ceased_date_month,
          ceasedDateYear: mockSessionData.ceased_date_year,
          stillInvolved: "0"
        });
      });

      test("Test stillInvolved flag not defined", () => {

        const trustId = '987';
        const trusteeId = '9998';

        const mockSessionData = {
          ...mockSessionDataBasic,
          still_involved: undefined,
        };

        const appData = {
          [TrustKey]: [{
            'trust_id': trustId,
            'CORPORATES': [ mockSessionData ] as TrustCorporate[],
          }]
        } as ApplicationData;
        expect(
          mapLegalEntityTrusteeByIdFromSessionToPage(appData, trustId, trusteeId)
        ).toEqual({
          legalEntityId: mockSessionData.id,
          legalEntityName: mockSessionData.name,
          principal_address_property_name_number: mockSessionData.ro_address_premises,
          principal_address_line_1: mockSessionData.ro_address_line_1,
          principal_address_line_2: mockSessionData.ro_address_line_2,
          principal_address_town: mockSessionData.ro_address_locality,
          principal_address_county: mockSessionData.ro_address_region,
          principal_address_country: mockSessionData.ro_address_country,
          principal_address_postcode: mockSessionData.ro_address_postal_code,
          service_address_property_name_number: mockSessionData.sa_address_premises,
          service_address_line_1: mockSessionData.sa_address_line_1,
          service_address_line_2: mockSessionData.sa_address_line_2,
          service_address_town: mockSessionData.sa_address_locality,
          service_address_county: mockSessionData.sa_address_region,
          service_address_country: mockSessionData.sa_address_country,
          service_address_postcode: mockSessionData.sa_address_postal_code,
          governingLaw: mockSessionData.identification_legal_authority,
          legalForm: mockSessionData.identification_legal_form,
          public_register_name: mockSessionData.identification_place_registered,
          public_register_jurisdiction: mockSessionData.identification_country_registration,
          registration_number: mockSessionData.identification_registration_number,
          is_service_address_same_as_principal_address: mockSessionData.is_service_address_same_as_principal_address,
          is_on_register_in_country_formed_in: mockSessionData.is_on_register_in_country_formed_in,
          is_newly_added: true,
          ceasedDateDay: mockSessionData.ceased_date_day,
          ceasedDateMonth: mockSessionData.ceased_date_month,
          ceasedDateYear: mockSessionData.ceased_date_year,
          stillInvolved: ""
        });
      });


      test("Test stillInvolved flag with invalid value", () => {

        const trustId = '987';
        const trusteeId = '9998';

          const mockSessionData = {
            ...mockSessionDataBasic,
            still_involved: "Wrong",
          };

          const appData = {
            [TrustKey]: [{
              'trust_id': trustId,
              'CORPORATES': [ mockSessionData ] as TrustCorporate[],
            }]
          } as ApplicationData;
          expect(
            mapLegalEntityTrusteeByIdFromSessionToPage(appData, trustId, trusteeId)
          ).toEqual({
            legalEntityId: mockSessionData.id,
            legalEntityName: mockSessionData.name,
            principal_address_property_name_number: mockSessionData.ro_address_premises,
            principal_address_line_1: mockSessionData.ro_address_line_1,
            principal_address_line_2: mockSessionData.ro_address_line_2,
            principal_address_town: mockSessionData.ro_address_locality,
            principal_address_county: mockSessionData.ro_address_region,
            principal_address_country: mockSessionData.ro_address_country,
            principal_address_postcode: mockSessionData.ro_address_postal_code,
            service_address_property_name_number: mockSessionData.sa_address_premises,
            service_address_line_1: mockSessionData.sa_address_line_1,
            service_address_line_2: mockSessionData.sa_address_line_2,
            service_address_town: mockSessionData.sa_address_locality,
            service_address_county: mockSessionData.sa_address_region,
            service_address_country: mockSessionData.sa_address_country,
            service_address_postcode: mockSessionData.sa_address_postal_code,
            governingLaw: mockSessionData.identification_legal_authority,
            legalForm: mockSessionData.identification_legal_form,
            public_register_name: mockSessionData.identification_place_registered,
            public_register_jurisdiction: mockSessionData.identification_country_registration,
            registration_number: mockSessionData.identification_registration_number,
            is_service_address_same_as_principal_address: mockSessionData.is_service_address_same_as_principal_address,
            is_on_register_in_country_formed_in: mockSessionData.is_on_register_in_country_formed_in,
            is_newly_added: true,
            ceasedDateDay: mockSessionData.ceased_date_day,
            ceasedDateMonth: mockSessionData.ceased_date_month,
            ceasedDateYear: mockSessionData.ceased_date_year,
            stillInvolved: ""
          });
      });

    });
  });
});
