jest.mock('uuid');

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as uuid from 'uuid';
import * as Page from '../../../src/model/trust.page.model';
import * as Trust from '../../../src/model/trust.model';
import { TrusteeType } from "../../../src/model/trustee.type.model";
import {
  generateId,
  mapLegalEntityItemToPage,
  mapLegalEntityToSession,
} from '../../../src/utils/trust/legal.entity.beneficial.owner.mapper';

describe('Trust Legal Entity Beneficial Owner Page Mapper Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test session mapper methods', () => {
    describe('Test trust legal entity form to session mapping', () => {
      const mockFormData = {
        legalEntityId: "9999",
        legalEntityName: "My Legal Entity",
        roleWithinTrust: "Interest Person",
        interestedPersonStartDateDay: "01",
        interestedPersonStartDateMonth: "01",
        interestedPersonStartDateYear: "2020",
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
      };

      test('Map legal entity trustee to session', () => {

        expect(mapLegalEntityToSession(mockFormData as Page.TrustLegalEntityForm)).toEqual({
          id: mockFormData.legalEntityId,
          type: mockFormData.roleWithinTrust,
          name: mockFormData.legalEntityName,
          date_became_interested_person_day: mockFormData.interestedPersonStartDateDay,
          date_became_interested_person_month: mockFormData.interestedPersonStartDateMonth,
          date_became_interested_person_year: mockFormData.interestedPersonStartDateYear,
          ro_address_premises: mockFormData.principal_address_property_name_number,
          ro_address_line1: mockFormData.principal_address_line_1,
          ro_address_line2: mockFormData.principal_address_line_2,
          ro_address_locality: mockFormData.principal_address_town,
          ro_address_region: mockFormData.principal_address_county,
          ro_address_country: mockFormData.principal_address_country,
          ro_address_postal_code: mockFormData.principal_address_postcode,
          ro_address_care_of: "",
          ro_address_po_box: "",
          sa_address_premises: mockFormData.service_address_property_name_number,
          sa_address_line1: mockFormData.service_address_line_1,
          sa_address_line2: mockFormData.service_address_line_2,
          sa_address_locality: mockFormData.service_address_town,
          sa_address_region: mockFormData.service_address_county,
          sa_address_country: mockFormData.service_address_country,
          sa_address_postal_code: mockFormData.service_address_postcode,
          sa_address_care_of: "",
          sa_address_po_box: "",
          identification_legal_authority: mockFormData.governingLaw,
          identification_legal_form: mockFormData.legalForm,
          identification_place_registered: mockFormData.public_register_name,
          identification_country_registration: mockFormData.public_register_jurisdiction,
          identification_registration_number: mockFormData.registration_number,
        });
      });

      test('test generateId', () => {
        const expectNewId = '9999';
        jest.spyOn(uuid, 'v4').mockReturnValue(expectNewId);

        expect(generateId()).toBe(expectNewId);
      });
    });

    describe('Test trust legal session to page mapping', () => {

      const mockSessionData = {
        id: "9998",
        name: "My Legal Entity in Session",
        type: "Interest Person",
        date_became_interested_person_day: "01",
        date_became_interested_person_month: "01",
        date_became_interested_person_year: "2020",
        ro_address_premises: "99",
        ro_address_line1: "Reg Office First Line",
        ro_address_line2: "Reg Office Second Line",
        ro_address_locality: "Reg Office Town",
        ro_address_region: "Reg Office County",
        ro_address_country: "Reg Office Country",
        ro_address_postal_code: "Reg Office Postcode",
        ro_address_care_of: "",
        ro_address_po_box: "",
        sa_address_premises: "100",
        sa_address_line1: "Serv First Line",
        sa_address_line2: "Serv Second Line",
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
      };
      test("Map legal entity trustee session data to page trustee item", () => {
        expect(
          mapLegalEntityItemToPage(mockSessionData as Trust.TrustCorporate)
        ).toEqual({
          id: mockSessionData.id,
          name: mockSessionData.name,
          trusteeItemType: TrusteeType.LEGAL_ENTITY,
        });
      });
    });
  });
});
