jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/trust/common.trust.data.mapper');
jest.mock("../../../src/middleware/navigation/update/has.presenter.middleware");
jest.mock("../../../src/middleware/navigation/has.trust.middleware");

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import {
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
  UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  TRUST_INVOLVED_URL,
  TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL
} from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { getApplicationData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { APPLICATION_DATA_MOCK, TRUST_WITH_ID } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, TRUST_INVOLVED_TITLE, ERROR_LIST } from '../../__mocks__/text.mock';
import { mapCommonTrustDataToPage } from '../../../src/utils/trust/common.trust.data.mapper';
import { RoleWithinTrustType } from "../../../src/model/role.within.trust.type.model";
import { yesNoResponse } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { hasTrustWithIdUpdate } from "../../../src/middleware/navigation/has.trust.middleware";
import * as trusts from "../../../src/utils/trusts";
import { Trust } from "../../../src/model/trust.model";

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue( APPLICATION_DATA_MOCK );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockMapCommonTrustDataToPage = mapCommonTrustDataToPage as jest.Mock;

const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasTrustWithIdUpdate = hasTrustWithIdUpdate as jest.Mock;
mockHasTrustWithIdUpdate.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const trustId = TRUST_WITH_ID.trust_id;
const pageUrl = UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL + "/" + trustId + TRUST_INVOLVED_URL;

describe('Update - Trusts - Individuals or entities involved', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned', async () => {
      const mockTrustData = {
        trustName: 'dummy',
      };
      mockMapCommonTrustDataToPage.mockReturnValue(mockTrustData);

      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUST_INVOLVED_TITLE);
      expect(resp.text).toContain(mockTrustData.trustName);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });
  });

  describe('POST tests', () => {
    test('redirects to trusts associated with the entity page', async () => {

      const resp = await request(app).post(pageUrl).send({ noMoreToAdd: 'noMoreToAdd' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
    });

    test('should return a validation error if ceased date is before trust creation date', async () => {
      const formSubmission = {
        trusteeId: 'trustee-id-2',
        roleWithinTrust: RoleWithinTrustType.GRANTOR,
        forename: 'Trust',
        surname: 'Ee',
        dateOfBirthDay: '1',
        dateOfBirthMonth: '2',
        dateOfBirthYear: '2022',
        nationality: 'Afghan',
        second_nationality: 'English',
        usual_residential_address_property_name_number: 'Usual 1',
        usual_residential_address_line_1: 'Usual New Line 1',
        usual_residential_address_line_2: 'Usual New Line 2',
        usual_residential_address_town: 'Usual New Town',
        usual_residential_address_county: 'Usual New County',
        usual_residential_address_country: 'Usual New Country',
        usual_residential_address_postcode: 'Usual NE994WS',
        usual_address_po_box: '',
        usual_address_care_of: '',
        service_address_property_name_number: 'Service 1',
        service_address_line_1: 'Service New Line 1',
        service_address_line_2: 'Service New Line 2',
        service_address_town: 'Service New Town',
        service_address_county: 'Service New County',
        service_address_country: 'Service New Country',
        service_address_postcode: 'Service NE994WS',
        service_address_po_box: '',
        service_address_care_of: '',
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        dateBecameIPDay: '2',
        dateBecameIPMonth: '8',
        dateBecameIPYear: '2023',
        stillInvolved: '0',
        ceasedDateDay: '10',
        ceasedDateMonth: '01',
        ceasedDateYear: '2023',
      };
      const trustInReview = {
        trust_id: 'trust-in-review-1',
        trust_name: 'Trust One',
        creation_date_day: '01',
        creation_date_month: '03',
        creation_date_year: '2023',
        review_status: { in_review: true }
      } as Trust;
      const appData = {
        entity_number: 'OE988669',
        entity_name: 'Tell us about the individual OE 1'
      };

      mockIsActiveFeature.mockReturnValue(true);
      const spyGetTrustByIdFromApp = jest.spyOn(trusts, "getTrustByIdFromApp");
      spyGetTrustByIdFromApp.mockReturnValueOnce(trustInReview);
      mockGetApplicationData.mockReturnValueOnce(appData);

      const resp = await request(app)
        .post(UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL)
        .send({
          ...formSubmission,
        });

      expect(resp.status).toBe(200);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.DATE_BEFORE_TRUST_CREATION_DATE_CEASED_TRUSTEE);

    });
  });
});
