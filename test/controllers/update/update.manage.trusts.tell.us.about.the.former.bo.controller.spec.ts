jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/save.and.continue');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import { SECURE_UPDATE_FILTER_URL, UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL, UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL } from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { checkBOsDetailsEntered, getApplicationData, setExtraData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { TRUST } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_FORMER_BO_TITLE, ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE, PAGE_NOT_FOUND_TEXT } from '../../__mocks__/text.mock';
import { UpdateKey } from '../../../src/model/update.type.model';
import { Trust, TrustHistoricalBeneficialOwner } from '../../../src/model/trust.model';
import { yesNoResponse } from '../../../src/model/data.types.model';
import { ApplicationData } from '../../../src/model';
import { saveAndContinue } from '../../../src/utils/save.and.continue';

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;

const mockApplicationData: ApplicationData = {
  [UpdateKey]: {
    review_trusts: [
      {
        ...TRUST,
        trust_id: "1",
        HISTORICAL_BO: [
          {
            id: "1234",
            forename: "BO",
            surname: "Individual",
            ch_references: "",
            corporate_indicator: yesNoResponse.No,
            ceased_date_day: "30",
            ceased_date_month: "8",
            ceased_date_year: "2022",
            notified_date_day: "30",
            notified_date_month: "8",
            notified_date_year: "1992",
          } as TrustHistoricalBeneficialOwner,
          {
            id: "5678",
            ch_references: "",
            corporate_name: "BO Corporate",
            corporate_indicator: yesNoResponse.No,
            ceased_date_day: "2",
            ceased_date_month: "2",
            ceased_date_year: "2022",
            notified_date_day: "3",
            notified_date_month: "3",
            notified_date_year: "2022",
          } as TrustHistoricalBeneficialOwner
        ],
        review_status: {
          in_review: true,
          reviewed_trust_details: false,
          reviewed_former_bos: false,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        }
      } as Trust
    ]
  }
};

mockRemoveJourneyMiddleware.mockClear();

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCheckBOsDetailsEntered = checkBOsDetailsEntered as jest.Mock;
mockCheckBOsDetailsEntered.mockReturnValue(true);

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe('Update - Manage Trusts - Review former beneficial owners', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // This performs a deep copy of the mock application data object, to ensure that the HISTORICAL_BO list is
    // created new each time and doesn't grow
    const clonedMockApplicationData = JSON.parse(JSON.stringify(mockApplicationData));

    mockGetApplicationData.mockReturnValue(clonedMockApplicationData);
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned for adding new former BO', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_FORMER_BO_TITLE);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);
      expect(resp.text).toContain("name of trust");
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when feature flag is on, page is returned for editing existing BO', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL + "/1234");

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_FORMER_BO_TITLE);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);
      expect(resp.text).toContain("name of trust");
      expect(resp.text).toContain("Individual");
      expect(resp.text).toContain("30");
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when feature flag is on, redirect if user tries to access with nothing to review', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValueOnce({ [UpdateKey]: { review_trusts: [] } });

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_URL);
    });

    test('when feature flag is on, redirect if user tries to access with wrong ID', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL + "/12");

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_URL);
    });

    test("catch error when rendering the page", async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe('POST tests', () => {

    beforeEach(() => {
      jest.clearAllMocks();

      // This performs a deep copy of the mock application data object, to ensure that the HISTORICAL_BO list is
      // created new each time and doesn't grow
      const clonedMockApplicationData = JSON.parse(JSON.stringify(mockApplicationData));

      mockGetApplicationData.mockReturnValue(clonedMockApplicationData);
    });

    test('when feature flag is on, and adding new legal former BO, redirects to update-manage-trusts-orchestrator', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL).send({
        type: 'legalEntity',
        corporate_name: 'Corporate BO',
        startDateDay: '18',
        startDateMonth: '9',
        startDateYear: '2023',
        endDateDay: '20',
        endDateMonth: '9',
        endDateYear: '2023',
        boId: ''
      });

      expect(resp.status).toEqual(302);
      expect(mockSaveAndContinue).toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
    });

    test('when feature flag is on, and adding new individual former BO, redirects to update-manage-trusts-orchestrator', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL).send({
        type: 'individual',
        firstName: 'Individual',
        lastName: 'BO',
        startDateDay: '18',
        startDateMonth: '9',
        startDateYear: '2023',
        endDateDay: '20',
        endDateMonth: '9',
        endDateYear: '2023',
        boId: ''
      });

      expect(resp.status).toEqual(302);
      expect(mockSaveAndContinue).toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
    });

    test('when feature flag is on, update existing former BO, redirects to update-manage-trusts-orchestrator', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL + "/1234").send({
        type: 'individual',
        firstName: 'Updated Individual',
        lastName: 'BO',
        startDateDay: '18',
        startDateMonth: '9',
        startDateYear: '2023',
        endDateDay: '20',
        endDateMonth: '9',
        endDateYear: '2023',
        boId: ''
      });

      expect(resp.status).toEqual(302);
      expect(mockSaveAndContinue).toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
    });

    test('triggers validation errors', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL).send({});

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("name of trust");
      expect(resp.text).toContain("Select if the former beneficial owner is an individual or a legal entity");
      expect(resp.text).toContain("Enter the date they became a beneficial owner");
      expect(resp.text).toContain("Enter the date they stopped being a beneficial owner");
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test('Redirects to update-manage-trusts-orchestrator wih no validation errors when dates contain spaces', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const mockSetExtraData = setExtraData as jest.Mock;

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL).send({
        type: 'legalEntity',
        corporate_name: 'Corporate BO',
        startDateDay: ' 18 ',
        startDateMonth: ' 9 ',
        startDateYear: ' 2022 ',
        endDateDay: ' 20 ',
        endDateMonth: ' 10 ',
        endDateYear: ' 2023 ',
        boId: ''
      });

      expect(resp.status).toEqual(302);
      expect(mockSaveAndContinue).toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);

      // Additionally check that date fields are trimmed before they're saved in the session
      const data = mockSetExtraData.mock.calls[0][1];
      const corporateBo = data["update"]["review_trusts"][0]["HISTORICAL_BO"][2];

      expect(corporateBo["notified_date_day"]).toEqual("18");
      expect(corporateBo["notified_date_month"]).toEqual("9");
      expect(corporateBo["notified_date_year"]).toEqual("2022");
      expect(corporateBo["ceased_date_day"]).toEqual("20");
      expect(corporateBo["ceased_date_month"]).toEqual("10");
      expect(corporateBo["ceased_date_year"]).toEqual("2023");
    });

    // ASM-350 - no feature flag in updateManageTrustsTellUsAboutTheFormerBo.post
    test.skip('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });

    test("catch error when posting", async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
