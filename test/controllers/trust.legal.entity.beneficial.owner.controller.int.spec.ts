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

import { NextFunction } from "express";
import app from "../../src/app";
import { TRUST_ENTRY_URL, TRUST_ENTRY_WITH_PARAMS_URL, TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE, TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL, TRUST_INVOLVED_URL } from "../../src/config";
import { authentication } from "../../src/middleware/authentication.middleware";
import { hasTrustWithIdRegister } from "../../src/middleware/navigation/has.trust.middleware";
import { Trust } from "../../src/model/trust.model";
import { saveAndContinue } from "../../src/utils/save.and.continue";
import { getTrustByIdFromApp } from "../../src/utils/trusts";
import { TRUST_WITH_ID } from "../__mocks__/session.mock";
import request from "supertest";
import { constants } from "http2";
import { ErrorMessages } from "../../src/validation/error.messages";
import { TrustLegalEntityForm } from "../../src/model/trust.page.model";
import { RoleWithinTrustType } from "../../src/model/role.within.trust.type.model";

import { isActiveFeature } from '../../src/utils/feature.flag';
import { serviceAvailabilityMiddleware } from '../../src/middleware/service.availability.middleware';
import { getUrlWithParamsToPath } from '../../src/utils/url';

const MOCKED_URL = "MOCKED_URL";
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockImplementation(() => MOCKED_URL);

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Legal entity beneficial owner integration tests", () => {

  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = TRUST_ENTRY_URL + "/" + trustId + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL;
  const pageWithParamsUrl = TRUST_ENTRY_WITH_PARAMS_URL + "/" + trustId + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL;
  let legalEntityWithMissingFields: Partial<TrustLegalEntityForm> & Partial<{is_service_address_same_as_principal_address, is_on_register_in_country_formed_in}>;

  beforeEach(() => {
    legalEntityWithMissingFields = {};
    jest.clearAllMocks();
    (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
  });

  describe("POST tests", () => {

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page with missing mandatory field messages`, async () => {

      // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      // Act
      const resp = await request(app).post(pageUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(decodedHTML).toContain(ErrorMessages.LEGAL_ENTITY_BO_NAME);
      expect(decodedHTML).toContain(ErrorMessages.LEGAL_ENTITY_BO_ROLE);
      expect(decodedHTML).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.LEGAL_FORM_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.LAW_GOVERNED);
      expect(decodedHTML).toContain(ErrorMessages.SELECT_IF_ON_PUBLIC_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(decodedHTML).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.ADDRESS_LINE1_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.CITY_OR_TOWN_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.COUNTRY_LEGAL_ENTITY_BO);
      expect(decodedHTML).not.toContain(ErrorMessages.PUBLIC_REGISTER_JURISDICTION);
      expect(decodedHTML).not.toContain(ErrorMessages.ENTITY_REGISTRATION_NUMBER);
      expect(decodedHTML).not.toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
    });

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page with errors for service address field and interested person date fields`, async () => {
      // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
      legalEntityWithMissingFields.legalEntityName = 'The Sherlock Holmes Museum';
      legalEntityWithMissingFields.roleWithinTrust = RoleWithinTrustType.INTERESTED_PERSON;
      legalEntityWithMissingFields.is_service_address_same_as_principal_address = '0';
      legalEntityWithMissingFields.principal_address_property_name_number = '221B';
      legalEntityWithMissingFields.principal_address_line_1 = 'Baker Street';
      legalEntityWithMissingFields.principal_address_town = 'London';
      legalEntityWithMissingFields.principal_address_country = 'United Kingdom';
      legalEntityWithMissingFields.legalForm = 'Private Limited Company (Ltd)';
      legalEntityWithMissingFields.governingLaw = 'Legal Ownership Act';
      legalEntityWithMissingFields.is_on_register_in_country_formed_in = '1';
      legalEntityWithMissingFields.registration_number = "007";
      legalEntityWithMissingFields.public_register_name = "Alpha and Omega, the beginning and the end";
      legalEntityWithMissingFields.public_register_jurisdiction = "Wakanda";

      // Act
      const resp = await request(app).post(pageUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(decodedHTML).not.toContain(ErrorMessages.LEGAL_ENTITY_BO_NAME);
      expect(decodedHTML).not.toContain(ErrorMessages.LEGAL_ENTITY_BO_ROLE);
      expect(decodedHTML).not.toContain(ErrorMessages.LEGAL_FORM_LEGAL_ENTITY_BO);
      expect(decodedHTML).not.toContain(ErrorMessages.LAW_GOVERNED);
      expect(decodedHTML).not.toContain(ErrorMessages.SELECT_IF_ON_PUBLIC_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(decodedHTML).not.toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_LEGAL_ENTITY_BO);
      expect(decodedHTML).not.toContain(ErrorMessages.ENTITY_REGISTRATION_NUMBER);
      expect(decodedHTML).not.toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(decodedHTML).not.toContain(ErrorMessages.PUBLIC_REGISTER_JURISDICTION);

      // Service Address Errors
      expect(decodedHTML).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.ADDRESS_LINE1_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.CITY_OR_TOWN_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.COUNTRY_LEGAL_ENTITY_BO);

      // Date Interested Person Errors
      expect(decodedHTML).toContain(ErrorMessages.ENTER_DATE_INTERESTED_PERSON_LEGAL_ENTITY_BO);
    });

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page with errors if public register name and public register jurisdiction add up to over 160`, async () => {
      // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
      legalEntityWithMissingFields.is_on_register_in_country_formed_in = '1';
      legalEntityWithMissingFields.public_register_name = "o1U2bHyHD4D7NqERnvhfq8Edd0FEJkretjmoYvNjEZxPs7BDvG4n5udaMaAzcTJhSkby1qWtt6c30A5yXwfVsXe0tEPNae4OF19x";
      legalEntityWithMissingFields.public_register_jurisdiction = "o1U2bHyHD4D7NqERnvhfq8Edd0FEJkretjmoYvNjEZxPs7BDvG4n5udaMaAzcTJhSkby1qWtt6c30A5yXwfVsXe0tEPNae4OF19x";

      // Act
      const resp = await request(app).post(pageUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(decodedHTML).toContain(ErrorMessages.NAME_REGISTRATION_JURISDICTION_LEGAL_ENTITY_BO);
    });

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page without errors if public register name and public register jurisdiction add up to less than 160`, async () => {
      // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
      legalEntityWithMissingFields.is_on_register_in_country_formed_in = '1';
      legalEntityWithMissingFields.public_register_name = "Deliverer";
      legalEntityWithMissingFields.public_register_jurisdiction = "Alpha and Omega, the beginning and the end";

      // Act
      const resp = await request(app).post(pageUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(decodedHTML).not.toContain(ErrorMessages.NAME_REGISTRATION_JURISDICTION_LEGAL_ENTITY_BO);
    });

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page without errors interested person date`, async () => {
    // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
      legalEntityWithMissingFields.roleWithinTrust = RoleWithinTrustType.INTERESTED_PERSON;
      legalEntityWithMissingFields.interestedPersonStartDateDay = "2";
      legalEntityWithMissingFields.interestedPersonStartDateMonth = "8";
      legalEntityWithMissingFields.interestedPersonStartDateYear = "2012";

      // Act
      const resp = await request(app).post(pageUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(decodedHTML).not.toContain(ErrorMessages.ENTER_DATE_INTERESTED_PERSON_LEGAL_ENTITY_BO);
      expect(decodedHTML).not.toContain(ErrorMessages.INVALID_DATE);
      expect(decodedHTML).not.toContain(ErrorMessages.DATE_NOT_IN_THE_PAST_INTERESTED_PERSON);
    });
  });

  describe("POST with params url tests", () => {

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page with missing mandatory field messages`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      // Act
      const resp = await request(app).post(pageWithParamsUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(TRUST_ENTRY_WITH_PARAMS_URL);
      expect(resp.text).toContain(MOCKED_URL + `/${trustId}${TRUST_INVOLVED_URL}`); // back link
      expect(decodedHTML).toContain(ErrorMessages.LEGAL_ENTITY_BO_NAME);
      expect(decodedHTML).toContain(ErrorMessages.LEGAL_ENTITY_BO_ROLE);
      expect(decodedHTML).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.LEGAL_FORM_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.LAW_GOVERNED);
      expect(decodedHTML).toContain(ErrorMessages.SELECT_IF_ON_PUBLIC_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(decodedHTML).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.ADDRESS_LINE1_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.CITY_OR_TOWN_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.COUNTRY_LEGAL_ENTITY_BO);
      expect(decodedHTML).not.toContain(ErrorMessages.PUBLIC_REGISTER_JURISDICTION);
      expect(decodedHTML).not.toContain(ErrorMessages.ENTITY_REGISTRATION_NUMBER);
      expect(decodedHTML).not.toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
    });

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page with errors for service address field and interested person date fields`, async () => {
      // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
      legalEntityWithMissingFields.legalEntityName = 'The Sherlock Holmes Museum';
      legalEntityWithMissingFields.roleWithinTrust = RoleWithinTrustType.INTERESTED_PERSON;
      legalEntityWithMissingFields.is_service_address_same_as_principal_address = '0';
      legalEntityWithMissingFields.principal_address_property_name_number = '221B';
      legalEntityWithMissingFields.principal_address_line_1 = 'Baker Street';
      legalEntityWithMissingFields.principal_address_town = 'London';
      legalEntityWithMissingFields.principal_address_country = 'United Kingdom';
      legalEntityWithMissingFields.legalForm = 'Private Limited Company (Ltd)';
      legalEntityWithMissingFields.governingLaw = 'Legal Ownership Act';
      legalEntityWithMissingFields.is_on_register_in_country_formed_in = '1';
      legalEntityWithMissingFields.registration_number = "007";
      legalEntityWithMissingFields.public_register_name = "Alpha and Omega, the beginning and the end";
      legalEntityWithMissingFields.public_register_jurisdiction = "Wakanda";

      // Act
      const resp = await request(app).post(pageWithParamsUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(decodedHTML).not.toContain(ErrorMessages.LEGAL_ENTITY_BO_NAME);
      expect(decodedHTML).not.toContain(ErrorMessages.LEGAL_ENTITY_BO_ROLE);
      expect(decodedHTML).not.toContain(ErrorMessages.LEGAL_FORM_LEGAL_ENTITY_BO);
      expect(decodedHTML).not.toContain(ErrorMessages.LAW_GOVERNED);
      expect(decodedHTML).not.toContain(ErrorMessages.SELECT_IF_ON_PUBLIC_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(decodedHTML).not.toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS_LEGAL_ENTITY_BO);
      expect(decodedHTML).not.toContain(ErrorMessages.ENTITY_REGISTRATION_NUMBER);
      expect(decodedHTML).not.toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(decodedHTML).not.toContain(ErrorMessages.PUBLIC_REGISTER_JURISDICTION);

      // Service Address Errors
      expect(decodedHTML).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.ADDRESS_LINE1_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.CITY_OR_TOWN_LEGAL_ENTITY_BO);
      expect(decodedHTML).toContain(ErrorMessages.COUNTRY_LEGAL_ENTITY_BO);

      // Date Interested Person Errors
      expect(decodedHTML).toContain(ErrorMessages.ENTER_DATE_INTERESTED_PERSON_LEGAL_ENTITY_BO);
    });

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page with errors if public register name and public register jurisdiction add up to over 160`, async () => {
      // Arrange
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
      legalEntityWithMissingFields.is_on_register_in_country_formed_in = '1';
      legalEntityWithMissingFields.public_register_name = "o1U2bHyHD4D7NqERnvhfq8Edd0FEJkretjmoYvNjEZxPs7BDvG4n5udaMaAzcTJhSkby1qWtt6c30A5yXwfVsXe0tEPNae4OF19x";
      legalEntityWithMissingFields.public_register_jurisdiction = "o1U2bHyHD4D7NqERnvhfq8Edd0FEJkretjmoYvNjEZxPs7BDvG4n5udaMaAzcTJhSkby1qWtt6c30A5yXwfVsXe0tEPNae4OF19x";

      // Act
      const resp = await request(app).post(pageWithParamsUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(TRUST_ENTRY_WITH_PARAMS_URL);
      expect(decodedHTML).toContain(ErrorMessages.NAME_REGISTRATION_JURISDICTION_LEGAL_ENTITY_BO);
    });

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page without errors if public register name and public register jurisdiction add up to less than 160`, async () => {
      // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
      legalEntityWithMissingFields.is_on_register_in_country_formed_in = '1';
      legalEntityWithMissingFields.public_register_name = "Deliverer";
      legalEntityWithMissingFields.public_register_jurisdiction = "Alpha and Omega, the beginning and the end";

      // Act
      const resp = await request(app).post(pageWithParamsUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(decodedHTML).not.toContain(ErrorMessages.NAME_REGISTRATION_JURISDICTION_LEGAL_ENTITY_BO);
    });

    test(`renders the ${TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_PAGE} page without errors interested person date`, async () => {
      // Arrange
      const mockTrust = <Trust>{};
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
      legalEntityWithMissingFields.roleWithinTrust = RoleWithinTrustType.INTERESTED_PERSON;
      legalEntityWithMissingFields.interestedPersonStartDateDay = "2";
      legalEntityWithMissingFields.interestedPersonStartDateMonth = "8";
      legalEntityWithMissingFields.interestedPersonStartDateYear = "2012";

      // Act
      const resp = await request(app).post(pageWithParamsUrl).send(legalEntityWithMissingFields);
      const decodedHTML = decodeHTML(resp.text);

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(decodedHTML).not.toContain(ErrorMessages.ENTER_DATE_INTERESTED_PERSON_LEGAL_ENTITY_BO);
      expect(decodedHTML).not.toContain(ErrorMessages.INVALID_DATE);
      expect(decodedHTML).not.toContain(ErrorMessages.DATE_NOT_IN_THE_PAST_INTERESTED_PERSON);
    });
  });
});

const decodeHTML = function(str) {
  return str.replace(/&#(\d+);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
};
