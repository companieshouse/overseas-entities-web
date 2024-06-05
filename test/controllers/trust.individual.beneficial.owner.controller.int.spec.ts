jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/trusts');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock('../../src/utils/url');

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction } from "express";
import request from "supertest";
import { constants } from 'http2';
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { hasTrustWithIdRegister } from '../../src/middleware/navigation/has.trust.middleware';
import { TRUST_ENTRY_URL, TRUST_ENTRY_WITH_PARAMS_URL, TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE, TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL, TRUST_INVOLVED_URL } from '../../src/config';
import { getTrustByIdFromApp } from '../../src/utils/trusts';
import { TRUST_WITH_ID } from '../__mocks__/session.mock';
import { saveAndContinue } from '../../src/utils/save.and.continue';
import { ErrorMessages } from '../../src/validation/error.messages';
import { yesNoResponse } from '../../src/model/data.types.model';
import { RoleWithinTrustType } from '../../src/model/role.within.trust.type.model';
import { Trust } from '../../src/model/trust.model';
import { IndividualTrusteesFormCommon } from '../../src/model/trust.page.model';
import * as maxLengthMocks from "../__mocks__/max.length.mock";
import { RESIDENTIAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK, SERVICE_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK } from "../__mocks__/validation.mock";
import { isActiveFeature } from '../../src/utils/feature.flag';
import { serviceAvailabilityMiddleware } from '../../src/middleware/service.availability.middleware';
import { getUrlWithParamsToPath } from '../../src/utils/url';

mockCsrfProtectionMiddleware.mockClear();
const MOCKED_URL = "MOCKED_URL";
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockImplementation(() => MOCKED_URL);

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe('Trust Individual Beneficial Owner Controller Integration Tests', () => {

  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = TRUST_ENTRY_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL;
  const pageUrlWithParams = TRUST_ENTRY_WITH_PARAMS_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
  });

  describe("POST tests", () => {

    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with missing mandatory field messages`, async () => {
      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const individualTrusteeMissingMandatoryFields = {
        roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
        forename: "",
        surname: "",
        dateOfBirthDay: "",
        dateOfBirthMonth: "",
        dateOfBirthYear: "",
        nationality: "",
        usual_residential_address_property_name_number: "",
        usual_residential_address_line_1: "",
        usual_residential_address_town: "",
        usual_residential_address_country: "",
        is_service_address_same_as_usual_residential_address: "",
        dateBecameIPDay: "",
        dateBecameIPMonth: "",
        dateBecameIPYear: "",
      };

      const resp =
        await request(app)
          .post(pageUrl)
          .send(individualTrusteeMissingMandatoryFields);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(resp.text).toContain(ErrorMessages.FIRST_NAME_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.LAST_NAME_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_INTERESTED_PERSON_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.NATIONALITY_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.COUNTRY_INDIVIDUAL_BO);
    });

    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with MAX error messages`, async () => {

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const individualTrusteeAboveMaximumFieldLengths: IndividualTrusteesFormCommon = {
        roleWithinTrust: RoleWithinTrustType.BENEFICIARY,
        forename: maxLengthMocks.MAX_50 + "1",
        surname: maxLengthMocks.MAX_50 + "1",
        dateOfBirthDay: "19",
        dateOfBirthMonth: "03",
        dateOfBirthYear: "1976",
        nationality: maxLengthMocks.NO_MAX,
        ...RESIDENTIAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
        ...SERVICE_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        dateBecameIPDay: "11",
        dateBecameIPMonth: "11",
        dateBecameIPYear: "1987",
      };

      const resp =
        await request(app)
          .post(pageUrl)
          .send(individualTrusteeAboveMaximumFieldLengths);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(resp.text).toContain(ErrorMessages.MAX_FIRST_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LAST_NAME_LENGTH_50);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
    });
    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with no nationality error messages`, async () => {

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const individualTrusteeAboveMaximumFieldLengths: Partial<IndividualTrusteesFormCommon> = {
        nationality: "Cameroon",
        second_nationality: "Argentina",
      };

      const resp =
        await request(app)
          .post(pageUrl)
          .send(individualTrusteeAboveMaximumFieldLengths);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(resp.text).not.toContain(ErrorMessages.NATIONALITY_INVALID_CHARACTERS);
      expect(resp.text).not.toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME_INDIVIDUAL_BO);
    });
    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with second nationality invalid error messages`, async () => {

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const individualTrusteeAboveMaximumFieldLengths: Partial<IndividualTrusteesFormCommon> = {
        nationality: "Cameroon",
        second_nationality: "_",
      };

      const resp =
        await request(app)
          .post(pageUrl)
          .send(individualTrusteeAboveMaximumFieldLengths);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();

      // Two errors one at the top and one over the element
      expect(2).toEqual(--resp.text.split(ErrorMessages.NATIONALITY_INVALID_CHARACTERS).length);
    });
  });

  describe("POST with params url tests", () => {

    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with missing mandatory field messages`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const individualTrusteeMissingMandatoryFields = {
        roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
        forename: "",
        surname: "",
        dateOfBirthDay: "",
        dateOfBirthMonth: "",
        dateOfBirthYear: "",
        nationality: "",
        usual_residential_address_property_name_number: "",
        usual_residential_address_line_1: "",
        usual_residential_address_town: "",
        usual_residential_address_country: "",
        is_service_address_same_as_usual_residential_address: "",
        dateBecameIPDay: "",
        dateBecameIPMonth: "",
        dateBecameIPYear: "",
      };

      const resp =
        await request(app)
          .post(pageUrlWithParams)
          .send(individualTrusteeMissingMandatoryFields);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(TRUST_ENTRY_WITH_PARAMS_URL);
      expect(resp.text).toContain(MOCKED_URL + `/${trustId}${TRUST_INVOLVED_URL}`); // back link
      expect(resp.text).toContain(ErrorMessages.FIRST_NAME_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.LAST_NAME_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_INTERESTED_PERSON_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.NATIONALITY_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INDIVIDUAL_BO);
      expect(resp.text).toContain(ErrorMessages.COUNTRY_INDIVIDUAL_BO);
    });

    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with MAX error messages`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const individualTrusteeAboveMaximumFieldLengths: IndividualTrusteesFormCommon = {
        roleWithinTrust: RoleWithinTrustType.BENEFICIARY,
        forename: maxLengthMocks.MAX_50 + "1",
        surname: maxLengthMocks.MAX_50 + "1",
        dateOfBirthDay: "19",
        dateOfBirthMonth: "03",
        dateOfBirthYear: "1976",
        nationality: maxLengthMocks.NO_MAX,
        ...RESIDENTIAL_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
        ...SERVICE_ADDRESS_WITH_MAX_LENGTH_FIELDS_MOCK,
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        dateBecameIPDay: "11",
        dateBecameIPMonth: "11",
        dateBecameIPYear: "1987",
      };

      const resp =
        await request(app)
          .post(pageUrlWithParams)
          .send(individualTrusteeAboveMaximumFieldLengths);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(TRUST_ENTRY_WITH_PARAMS_URL);
      expect(resp.text).toContain(ErrorMessages.MAX_FIRST_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LAST_NAME_LENGTH_50);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
    });

    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with no nationality error messages`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const individualTrusteeAboveMaximumFieldLengths: Partial<IndividualTrusteesFormCommon> = {
        nationality: "Cameroon",
        second_nationality: "Argentina",
      };

      const resp =
        await request(app)
          .post(pageUrlWithParams)
          .send(individualTrusteeAboveMaximumFieldLengths);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(resp.text).not.toContain(ErrorMessages.NATIONALITY_INVALID_CHARACTERS);
      expect(resp.text).not.toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME_INDIVIDUAL_BO);
    });

    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with second nationality invalid error messages`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const individualTrusteeAboveMaximumFieldLengths: Partial<IndividualTrusteesFormCommon> = {
        nationality: "Cameroon",
        second_nationality: "_",
      };

      const resp =
        await request(app)
          .post(pageUrlWithParams)
          .send(individualTrusteeAboveMaximumFieldLengths);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();

      // Two errors one at the top and one over the element
      expect(2).toEqual(--resp.text.split(ErrorMessages.NATIONALITY_INVALID_CHARACTERS).length);
    });
  });
});
