jest.mock("ioredis");
jest.mock("../../../src/utils/url");
jest.mock(".../../../src/utils/application.data");

import { Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { Params } from "express-serve-static-core";
import { logger } from "../../../src/utils/logger";
import { fetchApplicationData, getApplicationData } from "../../../src/utils/application.data";
import { isRegistrationJourney } from "../../../src/utils/url";
import { ApplicationData } from "../../../src/model";
import { yesNoResponse } from "../../../src/model/data.types.model";
import { RoleWithinTrustType } from "../../../src/model/role.within.trust.type.model";
import { TrusteeType } from "../../../src/model/trustee.type.model";
import { ANY_MESSAGE_ERROR } from "../../__mocks__/text.mock";

import {
  SECURE_UPDATE_FILTER_URL,
  SOLD_LAND_FILTER_URL
} from "../../../src/config";

import {
  APPLICATION_DATA_NO_TRUSTS_MOCK,
  APPLICATION_DATA_WITH_TRUST_ID_MOCK,
  TRUST_WITH_ID
} from "../../__mocks__/session.mock";

import {
  hasTrustWithIdRegister,
  hasTrustDataRegister,
  hasTrustWithIdUpdate,
  hasTrustDataUpdate,
  hasTrusteeWithIdUpdate
} from "../../../src/middleware/navigation/has.trust.middleware";

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(true);

describe("Trusts Middleware tests", () => {

  const mockGetApplicationData = getApplicationData as jest.Mock;
  const mockFetchApplicationData = fetchApplicationData as jest.Mock;
  const next = jest.fn();

  const res = {
    status: jest.fn().mockReturnThis() as any,
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;

  let req = {} as Request;

  beforeEach(() => {
    logger.infoRequest = jest.fn();

    jest.clearAllMocks();
  });

  describe('register tests', () => {

    test("Trust present, return next", async () => {
      req = {
        params: {
          trustId: TRUST_WITH_ID.trust_id,
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      await hasTrustWithIdRegister(req, res, next);

      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Trust not present, redirect to landing page", async () => {
      req = {
        params: {
          trustId: "otherID",
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      await hasTrustWithIdRegister(req, res, next);

      expect(res.redirect).toBeCalled();
      expect(res.redirect).toBeCalledWith(SOLD_LAND_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test("Submission contains trust data", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);
      await hasTrustDataRegister(req, res, next);
      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Submission does not contain trust data", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);
      await hasTrustDataRegister(req, res, next);
      expect(res.redirect).toBeCalled();
      expect(res.redirect).toBeCalledWith(SOLD_LAND_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test("catch error when renders the page", async () => {
      req = {
        params: {
          trustId: "otherID",
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });
      mockFetchApplicationData.mockImplementationOnce(() => { throw error; });

      await hasTrustWithIdRegister(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(error);
    });
  });

  describe('update tests', () => {
    test("Trust present, return next", async () => {
      req = {
        params: {
          trustId: TRUST_WITH_ID.trust_id,
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      await hasTrustWithIdUpdate(req, res, next);

      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Trust not present in hasTrusteeWithId, redirect to landing page", async () => {
      const appData: ApplicationData = {
        trusts: [
        ]
      };
      req = {
        params: {
          trustId: "1",
          trusteeType: "legalEntity",
          trusteeId: "1"
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(appData);
      mockFetchApplicationData.mockReturnValueOnce(appData);

      await hasTrusteeWithIdUpdate(req, res, next);

      expect(res.redirect).toBeCalledWith(SECURE_UPDATE_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test.each([TrusteeType.HISTORICAL, TrusteeType.INDIVIDUAL, TrusteeType.LEGAL_ENTITY])("Trustee of type %s present, return next", async (trusteeType) => {
      const appData: ApplicationData = {
        trusts: [
          {
            trust_id: "1",
            trust_name: "test",
            trust_still_involved_in_overseas_entity: "test",
            unable_to_obtain_all_trust_info: "test",
            creation_date_day: "20",
            creation_date_month: "12",
            creation_date_year: "1999",
            ch_reference: "test",
            CORPORATES: [
              {
                identification_legal_authority: "test",
                id: "1",
                identification_legal_form: "test",
                is_on_register_in_country_formed_in: yesNoResponse.Yes,
                is_service_address_same_as_principal_address: yesNoResponse.Yes,
                identification_country_registration: "test",
                identification_place_registered: "test",
                identification_registration_number: "test",
                ro_address_country: "test",
                ro_address_line_1: "test",
                ro_address_locality: "test",
                ro_address_postal_code: "test",
                ro_address_premises: "test",
                ro_address_region: "test",
                type: "test",
                name: "corporate test"
              }
            ],
            HISTORICAL_BO: [
              {
                id: "1",
                corporate_name: "history",
                ceased_date_day: "20",
                ceased_date_month: "12",
                ceased_date_year: "2020",
                surname: "test",
                forename: "test",
                notified_date_day: "20",
                notified_date_month: "12",
                notified_date_year: "1999",
                corporate_indicator: yesNoResponse.Yes
              }
            ],
            INDIVIDUALS: [
              {
                id: "1",
                forename: "test",
                surname: "individual",
                type: RoleWithinTrustType.BENEFICIARY,
                other_forenames: "",
                dob_day: "20",
                dob_month: "12",
                dob_year: "1999",
                nationality: "test",
                ura_address_country: "test",
                ura_address_line_1: "test",
                ura_address_locality: "test",
                ura_address_postal_code: "test",
                ura_address_premises: "test"
              }
            ]
          }
        ]
      };
      req = {
        params: {
          trustId: "1",
          trusteeType: trusteeType,
          trusteeId: "1"
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(appData);
      mockFetchApplicationData.mockReturnValueOnce(appData);

      await hasTrusteeWithIdUpdate(req, res, next);

      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Trust not present, redirect to landing page", async () => {
      req = {
        params: {
          trustId: "otherID",
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      await hasTrustWithIdUpdate(req, res, next);

      expect(res.redirect).toBeCalled();
      expect(res.redirect).toBeCalledWith(SECURE_UPDATE_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test("Submission contains trust data", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      await hasTrustDataUpdate(req, res, next);

      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Submission does not contain trust data", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);

      await hasTrustDataUpdate(req, res, next);

      expect(res.redirect).toBeCalled();
      expect(res.redirect).toBeCalledWith(SECURE_UPDATE_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test("catch error when renders the page", async () => {
      req = {
        params: {
          trustId: "otherID",
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });
      mockFetchApplicationData.mockImplementationOnce(() => { throw error; });

      await hasTrustWithIdUpdate(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(error);
    });
  });
});
