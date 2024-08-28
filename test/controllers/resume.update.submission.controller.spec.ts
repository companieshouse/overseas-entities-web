jest.mock("ioredis");
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/company.authentication.middleware');
jest.mock('../../src/service/overseas.entities.service');
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/feature.flag" );

import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from '../../src/app';
import { APPLICATION_DATA_MOCK, RESUME_UPDATE_SUBMISSION_URL, REVIEW_TRUST } from '../__mocks__/session.mock';

import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { authentication } from "../../src/middleware/authentication.middleware";
import { setExtraData } from "../../src/utils/application.data";
import { getOverseasEntity } from "../../src/service/overseas.entities.service";
import { getTransaction } from "../../src/service/transaction.service";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { companyAuthentication } from "../../src/middleware/company.authentication.middleware";
import { FOUND_REDIRECT_TO } from "../__mocks__/text.mock";
import { SECURE_UPDATE_FILTER_URL } from "../../src/config";
import { RoleWithinTrustType } from "../../src/model/role.within.trust.type.model";

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSetExtraData = setExtraData as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue( false );

const mockGetTransactionService = getTransaction as jest.Mock;
mockGetTransactionService.mockReturnValue( {} );

const mockGetOverseasEntity = getOverseasEntity as jest.Mock;
mockGetOverseasEntity.mockReturnValue( APPLICATION_DATA_MOCK );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Resume update submission controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`Redirect to ${SECURE_UPDATE_FILTER_URL} page and map trustees address`, async () => {
    mockIsActiveFeature.mockReturnValueOnce( true );
    mockIsActiveFeature.mockReturnValueOnce( true );

    mockGetOverseasEntity.mockReturnValueOnce( {
      ...APPLICATION_DATA_MOCK,
      update: { review_trusts: [ {
        ...REVIEW_TRUST,
        INDIVIDUALS: [
          {
            id: "1",
            ch_references: "CNFca5mzOxn9O_TW04SXGGolD-Y",
            forename: "INDIE",
            other_forenames: "",
            surname: "BENO",
            dob_day: "16",
            dob_month: "8",
            dob_year: "1982",
            nationality: "Bahraini",
            type: RoleWithinTrustType.SETTLOR,
            usual_residential_address: {
              property_name_number: "1",
              line_1: "INDIVIDUAL ROAD",
              locality: "INDIVIDUAL CITY",
              country: "United Kingdom",
              postcode: "INDBO1",
              line_2: "INDIVIDUAL VILLAGE",
              county: "INDIVIDUAL COUNTY",
              care_of: "",
              po_box: "",
            },
            service_address: {
              property_name_number: "1",
              line_1: "INDIVIDUAL ROAD",
              line_2: "INDIVIDUAL VILLAGE",
              locality: "INDIVIDUAL CITY",
              county: "INDIVIDUAL COUNTY",
              country: "United Kingdom",
              postcode: "INDBO1",
              care_of: "",
              po_box: ""
            },
            is_service_address_same_as_usual_residential_address: true
          },
        ],
        CORPORATES: []
      } ] }
    } );

    const resp = await request(app).get(RESUME_UPDATE_SUBMISSION_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${SECURE_UPDATE_FILTER_URL}`);

    expect(mockGetOverseasEntity).toHaveBeenCalledTimes(1);
    expect(mockSetExtraData).toHaveBeenCalledTimes(1);

    const appData = mockSetExtraData.mock.calls[0][1];
    expect(appData.update.review_trusts[0].INDIVIDUALS).toEqual([
      expect.objectContaining({
        id: '1',
        forename: 'INDIE',
        other_forenames: '',
        surname: 'BENO',
        dob_day: '16',
        dob_month: '8',
        dob_year: '1982',
        nationality: 'Bahraini',
        type: 'Settlor',
        ura_address_premises: '1',
        ura_address_line_1: 'INDIVIDUAL ROAD',
        ura_address_locality: 'INDIVIDUAL CITY',
        ura_address_country: 'United Kingdom',
        ura_address_postal_code: 'INDBO1',
        ura_address_line_2: 'INDIVIDUAL VILLAGE',
        ura_address_region: 'INDIVIDUAL COUNTY',
        ura_address_care_of: '',
        ura_address_po_box: '',
        sa_address_premises: '1',
        sa_address_line_1: 'INDIVIDUAL ROAD',
        sa_address_line_2: 'INDIVIDUAL VILLAGE',
        sa_address_locality: 'INDIVIDUAL CITY',
        sa_address_region: 'INDIVIDUAL COUNTY',
        sa_address_country: 'United Kingdom',
        sa_address_postal_code: 'INDBO1',
        sa_address_care_of: '',
        sa_address_po_box: '',
        is_service_address_same_as_usual_residential_address: true,
        second_nationality: undefined,
      })
    ]);
  });
});
