jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');
jest.mock('../../../src/service/company.managing.officer.service');
jest.mock('../../../src/service/persons.with.signficant.control.service');
jest.mock("../../../src/service/company.profile.service");
jest.mock("../../../src/service/private.overseas.entity.details");
jest.mock("../../../src/utils/feature.flag");
jest.mock("../../../src/utils/update/trust.model.fetch");

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import {
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_REMOVE_MOCK,
  APPLICATION_DATA_MOCK_WITHOUT_UPDATE,
  COMPANY_NUMBER,
  RESET_DATA_FOR_NO_CHANGE_RESPONSE,
  OVERSEAS_NAME_MOCK,
  RESET_DATA_FOR_CHANGE_RESPONSE,
} from '../../__mocks__/session.mock';
import { UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE, UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL, UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE, UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL, WHO_IS_MAKING_UPDATE_URL } from '../../../src/config';
import {
  ANY_MESSAGE_ERROR,
  RADIO_BUTTON_NO_SELECTED,
  RADIO_BUTTON_YES_SELECTED,
  SERVICE_UNAVAILABLE,
  UPDATE_DO_YOU_WANT_TO_CHANGE_OE_NO_TEXT,
  UPDATE_DO_YOU_WANT_TO_CHANGE_OE_TITLE,
  REMOVE_DO_YOU_WANT_TO_CHANGE_OE_TITLE
} from '../../__mocks__/text.mock';
import { logger } from '../../../src/utils/logger';
import { ErrorMessages } from '../../../src/validation/error.messages';
import { NoChangeKey } from '../../../src/model/update.type.model';
import { hasOverseasEntity } from '../../../src/middleware/navigation/update/has.overseas.entity.middleware';
import { MOCK_GET_COMPANY_PSC_ALL_BO_TYPES } from '../../__mocks__/get.company.psc.mock';
import { MOCK_GET_COMPANY_OFFICERS } from '../../__mocks__/get.company.officers.mock';
import { getCompanyPsc } from '../../../src/service/persons.with.signficant.control.service';
import { getCompanyOfficers } from '../../../src/service/company.managing.officer.service';
import { resetDataForNoChange, resetDataForChange } from '../../../src/controllers/update/overseas.entity.change.controller';
import { companyProfileQueryMock } from '../../__mocks__/update.entity.mocks';
import { getCompanyProfile } from '../../../src/service/company.profile.service';
import { getBeneficialOwnersPrivateData } from '../../../src/service/private.overseas.entity.details';
import { retrieveTrustData } from "../../../src/utils/update/trust.model.fetch";
import { isActiveFeature } from "../../../src/utils/feature.flag";

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetBeneficialOwnersPrivateData = getBeneficialOwnersPrivateData as jest.Mock;

const mockHasOverseasEntity = hasOverseasEntity as jest.Mock;
mockHasOverseasEntity.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

const mockGetCompanyPscService = getCompanyPsc as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockRetrieveTrustData = retrieveTrustData as jest.Mock;

describe("Overseas entity do you want to change your OE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`that ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page is rendered`, async() => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain(COMPANY_NUMBER);
      expect(resp.text).toContain(UPDATE_DO_YOU_WANT_TO_CHANGE_OE_TITLE);
      expect(resp.text).toContain(UPDATE_DO_YOU_WANT_TO_CHANGE_OE_NO_TEXT);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
    });

    test(`renders the ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page with radio button selected as No, I do not need to make changes`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [NoChangeKey]: "1" });
      const resp = await request(app).get(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_YES_SELECTED);
    });

    test(`renders the ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page with radio button selected as Yes, I need to make changes`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [NoChangeKey]: "0" });
      const resp = await request(app).get(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
    });

    test(`catch error when rendering ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page`, async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page with radios selected to No`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [NoChangeKey]: "0" });
      const resp = await request(app).get(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
    });
  });

  describe("GET remove journey tests", () => {
    test(`that ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page is rendered`, async() => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_REMOVE_MOCK });

      const resp = await request(app).get(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain(COMPANY_NUMBER);
      expect(resp.text).toContain(REMOVE_DO_YOU_WANT_TO_CHANGE_OE_TITLE);
      expect(resp.text).toContain(UPDATE_DO_YOU_WANT_TO_CHANGE_OE_NO_TEXT);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
    });
  });

  describe("POST tests", () => {

    test("retrieve trust data is not called if feature disabled and no update model data", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK_WITHOUT_UPDATE,
      });
      mockGetCompanyProfile.mockReturnValueOnce(companyProfileQueryMock);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockSaveAndContinue.mockReturnValueOnce(undefined);

      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "1" });
      expect(resp.status).toEqual(302);
      expect(mockRetrieveTrustData).not.toHaveBeenCalled();
    });

    test("retrieve trust data is called if feature enabled and empty update model in app data", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK_WITHOUT_UPDATE,
        update: {
        }
      });
      mockGetCompanyProfile.mockReturnValueOnce(companyProfileQueryMock);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockSaveAndContinue.mockReturnValueOnce(undefined);

      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "1" });
      expect(resp.status).toEqual(302);
      expect(mockRetrieveTrustData).toHaveBeenCalled();
    });

    test(`redirect to ${WHO_IS_MAKING_UPDATE_URL} on YES selection`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "0" });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(WHO_IS_MAKING_UPDATE_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toBeCalledWith(undefined, expect.objectContaining(
        {
          update:
                expect.objectContaining({
                  no_change: false
                })
        }));
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`redirect to ${UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE} on No, I do not need to make changes selection`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetCompanyProfile.mockReturnValueOnce(companyProfileQueryMock);
      mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
      mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
      mockGetBeneficialOwnersPrivateData.mockReturnValue([{}]);
      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "1" });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toBeCalledWith(undefined, expect.objectContaining(
        {
          update:
                expect.objectContaining({
                  no_change: true
                })
        }));
      expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
      expect(mockGetCompanyPscService).toHaveBeenCalledTimes(1);
      expect(mockGetCompanyOfficers).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("validation error when posting on Update journey", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_DO_YOU_WANT_TO_MAKE_OE_CHANGE);
    });

    test("validation error when posting on Remove journey", async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_REMOVE_MOCK });
      const resp = await request(app).post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_REMOVE_DO_YOU_WANT_TO_MAKE_OE_CHANGE);
    });

    test("catch error when posting the page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL)
        .send({ [NoChangeKey]: "NO" });
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("RESET post data", () => {

    test("That application data is reset when user chooses no change from change journey", async () => {
      const req = {} as Request;
      mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
      mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
      mockGetCompanyProfile.mockReturnValueOnce(companyProfileQueryMock);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

      expect(await resetDataForNoChange(req, APPLICATION_DATA_MOCK)).toMatchObject(
        {
          ...RESET_DATA_FOR_NO_CHANGE_RESPONSE
        }
      );
    });

    test("That session data is reset when user chooses change journey from no change journey", () => {
      expect(resetDataForChange(APPLICATION_DATA_MOCK)).toMatchObject(
        {
          ...RESET_DATA_FOR_CHANGE_RESPONSE
        }
      );
    });
  });
});
