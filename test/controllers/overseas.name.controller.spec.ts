jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/is.secure.register.middleware');
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  INTERRUPT_CARD_URL,
  INTERRUPT_CARD_WITH_PARAMS_URL,
  PRESENTER_URL,
  PRESENTER_WITH_PARAMS_URL,
  LANDING_PAGE_URL,
  OVERSEAS_NAME_PAGE,
  OVERSEAS_NAME_URL,
  OVERSEAS_NAME_WITH_PARAMS_URL,
  PRESENTER_PAGE,
} from "../../src/config";
import { getApplicationData, setExtraData } from "../../src/utils/application.data";
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  OVERSEAS_NAME_PAGE_TITLE,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SERVICE_UNAVAILABLE
} from '../__mocks__/text.mock';
import {
  APPLICATION_DATA_MOCK,
  OVERSEAS_ENTITY_ID,
  OVERSEAS_NAME_MOCK,
  TRANSACTION_ID
} from '../__mocks__/session.mock';
import { isSecureRegister } from "../../src/middleware/navigation/is.secure.register.middleware";
import { postTransaction } from "../../src/service/transaction.service";
import { createOverseasEntity, updateOverseasEntity } from "../../src/service/overseas.entities.service";
import { EntityNameKey, OverseasEntityKey, Transactionkey } from '../../src/model/data.types.model';
import { ErrorMessages } from '../../src/validation/error.messages';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { getUrlWithParamsToPath, getUrlWithTransactionIdAndSubmissionId, transactionIdAndSubmissionIdExistInRequest } from "../../src/utils/url";

mockCsrfProtectionMiddleware.mockClear();
const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockCreateOverseasEntity = createOverseasEntity as jest.Mock;
mockCreateOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockIsSecureRegisterMiddleware = isSecureRegister as jest.Mock;
mockIsSecureRegisterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue( APPLICATION_DATA_MOCK );

const mockSetExtraData = setExtraData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const MOCKED_PAGE_URL = "/MOCKED_PAGE";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(MOCKED_PAGE_URL);

const mockGetUrlWithTransactionIdAndSubmissionId = getUrlWithTransactionIdAndSubmissionId as jest.Mock;
mockGetUrlWithTransactionIdAndSubmissionId.mockReturnValue(MOCKED_PAGE_URL);

const mockTransactionIdAndSubmissionIdExistInRequest = transactionIdAndSubmissionIdExistInRequest as jest.Mock;
mockTransactionIdAndSubmissionIdExistInRequest.mockReturnValue(true);

describe("Overseas Name controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockSetExtraData.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the ${OVERSEAS_NAME_PAGE} page with empty data`, async () => {
      mockGetApplicationData.mockReturnValueOnce(undefined);
      const resp = await request(app).get(OVERSEAS_NAME_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(OVERSEAS_NAME_PAGE_TITLE);
      expect(resp.text).not.toContain(OVERSEAS_NAME_MOCK);
    });

    test(`renders the ${OVERSEAS_NAME_PAGE} page with ${SAVE_AND_CONTINUE_BUTTON_TEXT} button`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [EntityNameKey]: OVERSEAS_NAME_MOCK });
      const resp = await request(app).get(OVERSEAS_NAME_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain(OVERSEAS_NAME_PAGE_TITLE);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("catch error when renders the presenter page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(OVERSEAS_NAME_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${OVERSEAS_NAME_PAGE} page with back link URL correctly set`, async () => {
      mockGetApplicationData.mockReturnValueOnce(undefined);
      const resp = await request(app).get(OVERSEAS_NAME_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(INTERRUPT_CARD_URL);
    });
  });

  describe("GET with url params tests", () => {
    test(`renders the ${OVERSEAS_NAME_PAGE} page with empty data`, async () => {
      mockGetApplicationData.mockReturnValueOnce(undefined);
      const resp = await request(app).get(OVERSEAS_NAME_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(OVERSEAS_NAME_PAGE_TITLE);
      expect(resp.text).not.toContain(OVERSEAS_NAME_MOCK);
    });

    test(`renders the ${OVERSEAS_NAME_PAGE} page with ${SAVE_AND_CONTINUE_BUTTON_TEXT} button`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [EntityNameKey]: OVERSEAS_NAME_MOCK });
      const resp = await request(app).get(OVERSEAS_NAME_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain(OVERSEAS_NAME_PAGE_TITLE);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("catch error when renders the presenter page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(OVERSEAS_NAME_WITH_PARAMS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${OVERSEAS_NAME_PAGE} page with back link URL correctly set`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce(undefined);
      const resp = await request(app).get(OVERSEAS_NAME_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MOCKED_PAGE_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(INTERRUPT_CARD_WITH_PARAMS_URL);
    });
  });

  describe("POST tests", () => {
    test(`redirect to the ${PRESENTER_PAGE} page after a successful post from ${OVERSEAS_NAME_PAGE} page`, async () => {
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${PRESENTER_URL}`);
    });

    test(`redirect to the ${PRESENTER_PAGE} page with transaction and overseas entity already created with the REDIS_flag ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const mockData = { ...APPLICATION_DATA_MOCK };
      mockGetApplicationData.mockReturnValueOnce(mockData);
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockTransactionService).not.toHaveBeenCalled();
      expect(mockCreateOverseasEntity).not.toHaveBeenCalled();

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${MOCKED_PAGE_URL}`);
    });

    test(`redirect to the ${PRESENTER_PAGE} page with transaction and overseas entity already created with the REDIS_flag OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const mockData = { ...APPLICATION_DATA_MOCK };
      mockGetApplicationData.mockReturnValueOnce(mockData);
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockTransactionService).not.toHaveBeenCalled();
      expect(mockCreateOverseasEntity).not.toHaveBeenCalled();

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${PRESENTER_URL}`);
    });

    test(`redirect to the ${PRESENTER_PAGE} page after a successful creation of transaction and overseas entity with REDIS_removal flag set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const mockData = { ...APPLICATION_DATA_MOCK, [Transactionkey]: null, [OverseasEntityKey]: null };
      mockGetApplicationData.mockReturnValueOnce(mockData);
      mockSetExtraData.mockReturnValue(true);
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(mockSetExtraData.mock.calls[0][1][Transactionkey]).toEqual(TRANSACTION_ID);
      expect(mockSetExtraData.mock.calls[0][1][OverseasEntityKey]).toEqual(OVERSEAS_ENTITY_ID);
      expect(mockTransactionService).toHaveBeenCalledTimes(1);
      expect(mockCreateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${PRESENTER_URL}`);
    });

    test(`redirect to the ${PRESENTER_PAGE} page after a successful update of transaction and overseas entity with REDIS_removal flag set to ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_SAVE_AND_RESUME
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const mockData = { ...APPLICATION_DATA_MOCK };
      mockGetApplicationData.mockReturnValueOnce(mockData);
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(mockData[Transactionkey]).toEqual(TRANSACTION_ID);
      expect(mockData[OverseasEntityKey]).toEqual(OVERSEAS_ENTITY_ID);
      expect(mockTransactionService).not.toHaveBeenCalledTimes(1);
      expect(mockCreateOverseasEntity).not.toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData.mock.calls[0][1][Transactionkey]).toEqual(TRANSACTION_ID);
      expect(mockSetExtraData.mock.calls[0][1][OverseasEntityKey]).toEqual(OVERSEAS_ENTITY_ID);

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${MOCKED_PAGE_URL}`);
    });

    test(`renders the current page with ${ErrorMessages.ENTITY_NAME} error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_NAME_URL)
        .send({ [EntityNameKey]: " ".repeat(161) });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.ENTITY_NAME);
      expect(resp.text).not.toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
    });

    test(`renders the current page with ${ErrorMessages.MAX_NAME_LENGTH} error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_NAME_URL)
        .send({ [EntityNameKey]: "Д".repeat(161) });

      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME);
      expect(resp.text).toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
    });

    test(`renders the current page with ${ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS} error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_NAME_URL)
        .send({ [EntityNameKey]: "Дракон" });

      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME);
      expect(resp.text).not.toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
    });

    test(`catch error when post data from ${OVERSEAS_NAME_PAGE} page`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(OVERSEAS_NAME_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST with url params tests", () => {
    test(`redirect to the ${PRESENTER_PAGE} page after a successful post from ${OVERSEAS_NAME_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app).post(OVERSEAS_NAME_WITH_PARAMS_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(MOCKED_PAGE_URL);
      expect(mockGetUrlWithTransactionIdAndSubmissionId).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithTransactionIdAndSubmissionId.mock.calls[0][0]).toEqual(PRESENTER_WITH_PARAMS_URL);
    });

    test(`redirect to the ${PRESENTER_PAGE} page with transaction and overseas entity already created`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const mockData = { ...APPLICATION_DATA_MOCK };
      mockGetApplicationData.mockReturnValueOnce({}); // Needed at the setExtraData
      mockGetApplicationData.mockReturnValueOnce(mockData); // Needed inside the feature flag

      const resp = await request(app).post(OVERSEAS_NAME_WITH_PARAMS_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(302);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockTransactionService).not.toHaveBeenCalled();
      expect(mockCreateOverseasEntity).not.toHaveBeenCalled();

      expect(resp.text).toContain(MOCKED_PAGE_URL);
    });

    test(`renders the current page with ${ErrorMessages.ENTITY_NAME} error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_NAME_WITH_PARAMS_URL)
        .send({ [EntityNameKey]: " ".repeat(161) });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.ENTITY_NAME);
      expect(resp.text).not.toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
    });

    test(`renders the current page with ${ErrorMessages.MAX_NAME_LENGTH} error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_NAME_WITH_PARAMS_URL)
        .send({ [EntityNameKey]: "Д".repeat(161) });

      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME);
      expect(resp.text).toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
    });

    test(`renders the current page with ${ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS} error messages`, async () => {
      const resp = await request(app)
        .post(OVERSEAS_NAME_WITH_PARAMS_URL)
        .send({ [EntityNameKey]: "Дракон" });

      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME);
      expect(resp.text).not.toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
    });

    test(`catch error when post data from ${OVERSEAS_NAME_PAGE} page`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(OVERSEAS_NAME_WITH_PARAMS_URL).send({ [EntityNameKey]: OVERSEAS_NAME_MOCK });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
