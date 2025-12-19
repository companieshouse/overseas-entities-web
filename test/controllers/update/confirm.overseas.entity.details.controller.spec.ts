jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock("../../../src/utils/feature.flag" );
jest.mock('../../../src/service/persons.with.signficant.control.statement.service');

import request from "supertest";
import { NextFunction } from "express";

import { beforeEach, jest, describe } from "@jest/globals";
// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";

import * as config from "../../../src/config";
import app from "../../../src/app";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { UpdateKey } from "../../../src/model/update.type.model";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getCompanyPscStatements } from "../../../src/service/persons.with.signficant.control.statement.service";

import { getApplicationData, fetchApplicationData } from "../../../src/utils/application.data";

import {
  ANY_MESSAGE_ERROR,
  BACK_LINK_FOR_UPDATE_OE_CONFIRM,
  SERVICE_UNAVAILABLE
} from "../../__mocks__/text.mock";

import {
  testEntityNumber,
  testEntityName,
  entityModelMock,
  entityProfileModelMock,
  updateModelMock,
  missingDateOfCreationMock,
  testIncorporationCountry
} from "../../__mocks__/update.entity.mocks";

import {
  APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
  BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK,
  BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  APPLICATION_DATA_UPDATE_BO_MOCK
} from "../../__mocks__/session.mock";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);
const mockGetCompanyPscStatements = getCompanyPscStatements as jest.Mock;

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Confirm company data", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReset();
    mockFetchApplicationData.mockReset();
    mockIsActiveFeature.mockReset();
  });

  describe("Get confirm overseas entity details", () => {

    test(`renders the ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} page for the update journey - flag off`, async () => {
      mockIsActiveFeature.mockReturnValue(false); // Redis removal
      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock).mockReturnValueOnce(entityProfileModelMock);
      mockFetchApplicationData.mockReturnValueOnce(entityProfileModelMock).mockReturnValueOnce(entityProfileModelMock);
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BACK_LINK_FOR_UPDATE_OE_CONFIRM);
      expect(resp.text).toContain(testEntityName);
      expect(resp.text).toContain("January");
      expect(resp.text).toContain(testEntityNumber);
      expect(resp.text).toContain(testIncorporationCountry);
      expect(resp.text).toContain(config.UPDATE_SERVICE_NAME);
    });

    test(`renders the ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} page for the update journey - flag on`, async () => {
      mockIsActiveFeature.mockReturnValue(true); // Redis removal
      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock).mockReturnValueOnce(entityProfileModelMock);
      mockFetchApplicationData.mockReturnValueOnce(entityProfileModelMock).mockReturnValueOnce(entityProfileModelMock);
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BACK_LINK_FOR_UPDATE_OE_CONFIRM);
      expect(resp.text).toContain(testEntityName);
      expect(resp.text).toContain("January");
      expect(resp.text).toContain(testEntityNumber);
      expect(resp.text).toContain(testIncorporationCountry);
      expect(resp.text).toContain(config.UPDATE_SERVICE_NAME);
    });

    test(`renders the ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} page for the remove journey`, async () => {
      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock).mockReturnValueOnce(entityProfileModelMock);
      mockFetchApplicationData.mockReturnValueOnce(entityProfileModelMock).mockReturnValueOnce(entityProfileModelMock);
      const resp = await request(app).get(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(`${BACK_LINK_FOR_UPDATE_OE_CONFIRM}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.text).toContain(testEntityName);
      expect(resp.text).toContain("January");
      expect(resp.text).toContain(testEntityNumber);
      expect(resp.text).toContain(testIncorporationCountry);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
    });

    test(`redirects if no update data - flag off`, async () => {
      mockGetApplicationData.mockReturnValueOnce(entityModelMock);
      mockIsActiveFeature.mockReturnValue(false); // Redis removal
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test(`redirects if no update data - flag on`, async () => {
      mockGetApplicationData.mockReturnValueOnce(entityModelMock);
      mockIsActiveFeature.mockReturnValue(true); // Redis removal
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL);
    });

    test(`redirects if no date of creation - flag off`, async () => {
      mockGetApplicationData.mockReturnValueOnce(missingDateOfCreationMock);
      mockIsActiveFeature.mockReturnValue(false); // Redis removal
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test(`redirects if no date of creation - flag on`, async () => {
      mockGetApplicationData.mockReturnValueOnce(missingDateOfCreationMock);
      mockIsActiveFeature.mockReturnValue(true); // Redis removal

      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL);
    });

    test(`redirects if no entity data - flag off`, async () => {
      mockGetApplicationData.mockReturnValueOnce(updateModelMock);
      mockIsActiveFeature.mockReturnValue(false); // Redis removal

      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test(`redirects if no entity data - flag on`, async () => {
      mockGetApplicationData.mockReturnValueOnce(updateModelMock);
      mockIsActiveFeature.mockReturnValue(true); // Redis removal

      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL);
    });

    test('catch error when rendering the page - flag off', async () => {
      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock);
      mockIsActiveFeature.mockReturnValue(false); // Redis removal

      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test('catch error when rendering the page - flag on', async () => {
      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock);
      mockIsActiveFeature.mockReturnValue(true); // Redis removal

      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("Post update confirm overseas entity details", () => {
    test(`redirects to overseas-entity-query page if no entity - flag off`, async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValue(false); // Redis removal

      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test(`redirects to overseas-entity-query page if no entity - flag on`, async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValue(true); // Redis removal

      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL);
    });

    test(`redirect to update-filing-date if no BOs - redis removal flag off`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockIsActiveFeature.mockReturnValueOnce(false); // relevant period
      mockIsActiveFeature.mockReturnValueOnce(false); // Redis removal
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_URL);
    });

    test(`redirect to update-filing-date if no BOs - redis removal flag on`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockIsActiveFeature.mockReturnValueOnce(false); // relevant period
      mockIsActiveFeature.mockReturnValueOnce(true); // Redis removal
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_WITH_PARAMS_URL);
    });

    test(`redirect to update-filing-date if no BOs when FEATURE_FLAG_ENABLE_RELEVANT_PERIOD is active - redis removal flag off`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockIsActiveFeature.mockReturnValueOnce(true); // relevant period
      mockIsActiveFeature.mockReturnValueOnce(false); // Redis removal

      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
    });

    test(`redirect to update-filing-date if no BOs when FEATURE_FLAG_ENABLE_RELEVANT_PERIOD is active - redis removal flag on`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockIsActiveFeature.mockReturnValueOnce(true); // relevant period
      mockIsActiveFeature.mockReturnValueOnce(true); // Redis removal

      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_WITH_PARAMS_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
    });

    test.each([
      ["BO Individual", "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK ],
      ["BO Corporate", "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK ]
    ])(`redirect to update-filing-date if %s but does not have nature of controls related to trusts - redis removal flag off`, async (_, key, mockObject) => {
      let appData = {};
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[UpdateKey] = {
        ...UPDATE_OBJECT_MOCK,
        [key]: [ mockObject ]
      };

      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockIsActiveFeature.mockReturnValueOnce(false); // relevant period
      mockIsActiveFeature.mockReturnValueOnce(false); // Redis removal
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_URL);
    });

    test.each([
      ["BO Individual", "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK ],
      ["BO Corporate", "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK ]
    ])(`redirect to update-filing-date if %s but does not have nature of controls related to trusts - redis removal flag on`, async (_, key, mockObject) => {
      let appData = {};
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[UpdateKey] = {
        ...UPDATE_OBJECT_MOCK,
        [key]: [ mockObject ]
      };

      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      mockIsActiveFeature.mockReturnValueOnce(false); // relevant period
      mockIsActiveFeature.mockReturnValueOnce(true); // Redis removal
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_WITH_PARAMS_URL);
    });

    test('catch error when posting to the page', async () => {
      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock);

      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL).send({});
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("Post remove confirm overseas entity details", () => {
    test(`redirects to overseas-entity-query page if no entity`, async () => {
      mockGetApplicationData.mockReturnValueOnce({});

      const resp = await request(app).post(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test.each([
      ["BO Individual", "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK ],
      ["BO Corporate", "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK ]
    ])(`redirect to presenter page if %s but does not have nature of controls related to trusts`, async (_, key, mockObject) => {
      let appData = {};
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[UpdateKey] = {
        ...UPDATE_OBJECT_MOCK,
        [key]: [ mockObject ]
      };

      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      const resp = await request(app).post(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${config.OVERSEAS_ENTITY_PRESENTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    });
  });

  test.each([
    ["BO Individual", "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK ],
    ["BO Corporate", "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ]
  ])(`redirect to update-filing-date if %s has trusts NOC - redis removal flag off`, async (_, key, mockObject) => {

    let appData = {};
    appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
    appData[UpdateKey] = {
      ...UPDATE_OBJECT_MOCK,
      [key]: [ mockObject ]
    };

    mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
    mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
    mockIsActiveFeature.mockReturnValueOnce(false); // relevant period
    mockIsActiveFeature.mockReturnValueOnce(false); // Redis removal
    const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_URL);
  });

  test.each([
    ["BO Individual", "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK ],
    ["BO Corporate", "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ]
  ])(`redirect to update-filing-date if %s has trusts NOC - redis removal flag on`, async (_, key, mockObject) => {

    let appData = {};
    appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
    appData[UpdateKey] = {
      ...UPDATE_OBJECT_MOCK,
      [key]: [ mockObject ]
    };

    mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
    mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
    mockIsActiveFeature.mockReturnValueOnce(false); // relevant period
    mockIsActiveFeature.mockReturnValueOnce(true); // Redis removal
    const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL).send({});

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_WITH_PARAMS_URL);
  });

  test.each([
    ["BO Individual", "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK ],
    ["BO Corporate", "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ]
  ])(`redirect to presenter page if %s has trusts NOC`, async (_, key, mockObject) => {

    let appData = {};
    appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
    appData[UpdateKey] = {
      ...UPDATE_OBJECT_MOCK,
      [key]: [ mockObject ]
    };

    mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
    const resp = await request(app).post(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`).send({});

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(`${config.OVERSEAS_ENTITY_PRESENTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  });

  test(`should redirect to relevant period filer page if feature flag active and no relevantPeriodStatements - redis removal flag off`, async () => {
    mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
    mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
    mockIsActiveFeature.mockReturnValueOnce(true);
    const mockStatement = {
      statement: 'no-individual-or-entity-with-signficant-control' };
    mockGetCompanyPscStatements.mockReturnValue(mockStatement);
    mockIsActiveFeature.mockReturnValueOnce(false); // Redis removal

    const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL + config.RELEVANT_PERIOD_QUERY_PARAM);

  });

  test(`should redirect to relevant period filer page if feature flag active and no relevantPeriodStatements - redis removal flag on`, async () => {
    mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
    mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
    mockIsActiveFeature.mockReturnValueOnce(true);
    const mockStatement = {
      statement: 'no-individual-or-entity-with-signficant-control' };
    mockGetCompanyPscStatements.mockReturnValue(mockStatement);
    mockIsActiveFeature.mockReturnValueOnce(true); // Redis removal

    const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL).send({});

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_WITH_PARAMS_URL + config.RELEVANT_PERIOD_QUERY_PARAM);

  });

  test(`should redirect to update filing page if any relevant Period psc statements exist - redis removal flag off`, async () => {
    mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
    mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
    mockIsActiveFeature.mockReturnValueOnce(true);
    const mockStatements = [ { statement: 'change-beneficiary-relevant-period' },
      { statement: 'all-beneficial-owners-identified' } ];
    mockGetCompanyPscStatements.mockReturnValue({ items: mockStatements });
    mockIsActiveFeature.mockReturnValueOnce(false); // Redis removal

    const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_URL);
  });

  test(`should redirect to update filing page if any relevant Period psc statements exist - redis removal flag on`, async () => {
    mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
    mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_BO_MOCK);
    mockIsActiveFeature.mockReturnValueOnce(true);
    const mockStatements = [ { statement: 'change-beneficiary-relevant-period' },
      { statement: 'all-beneficial-owners-identified' } ];
    mockGetCompanyPscStatements.mockReturnValue({ items: mockStatements });
    mockIsActiveFeature.mockReturnValueOnce(true); // Redis removal

    const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_WITH_PARAMS_URL).send({});

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_WITH_PARAMS_URL);
  });

});

