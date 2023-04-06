jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/trusts');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
// import { NextFunction, Request, Response } from "express";
import { NextFunction } from "express";
import request from "supertest";
import { constants } from 'http2';
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { hasTrustWithId } from '../../src/middleware/navigation/has.trust.middleware';
import { TRUST_ENTRY_URL, TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL } from '../../src/config';
// import { getApplicationData, setExtraData } from '../../src/utils/application.data';
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

const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe('Trust Individual Beneficial Owner Controller Integration Tests', () => {
  // const mockGetApplicationData = getApplicationData as jest.Mock;

  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = TRUST_ENTRY_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    (hasTrustWithId as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
  });

  test('renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page with MAX error messages', async () => {

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

});
