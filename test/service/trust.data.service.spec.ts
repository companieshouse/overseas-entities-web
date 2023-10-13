jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/service/retry.handler.service");

import { Request } from "express";

import { createAndLogErrorRequest } from "../../src/utils/logger";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import { ERROR, getSessionRequestWithExtraData } from "../__mocks__/session.mock";
import {
  getTrustData,
  getTrustLinks,
  getIndividualTrustees,
  getCorporateTrustees
} from "../../src/service/trust.data.service";

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const session = getSessionRequestWithExtraData();
const req = { session } as Request;

const transactionId = '13579';
const overseasEntityId = '2468';
const trustId = '123456789';
const serviceName = 'overseasEntity';
const trustDataFunctionName = 'getTrustData';
const trustLinksFunctionName = 'getTrustLinks';
const individualTrusteesFunctionName = 'getIndividualTrustees';
const corporateTrusteesFunctionName = 'getCorporateTrustees';

const trustDataMock = [
  {
    hashedTrustId: "123456789",
    trustName: "Trust Name",
    creationDate: "1965-01-01",
    unableToObtainAllTrustInfoIndicator: false
  }
];

const trustLinksMock = [
  {
    hashedTrustId: "123456789",
    hashedCorporateBodyAppointmentId: "123456789",
  }
];

const IndividualTrusteeDataMock = [{
  hashedTrusteeId: "123",
  trusteeForename1: "joe",
  trusteeForename2: "jim",
  trusteeSurname: "bloggs",
  dateOfBirth: "2003-03-31",
  nationality: "German",
  corporateIndicator: "N",
  trusteeTypeId: "50002",
  appointmentDate: "2020-02-20",
  ceasedDate: "2020-02-20",
  serviceAddress: {
    addressLine1: "sa_addressline1",
    addressLine2: "sa_addressline2",
    careOf: "sa_careof",
    country: "sa_country",
    locality: "sa_locality",
    poBox: "sa_pobox",
    postalCode: "sa_postcode",
    premises: "sa_premises",
    region: "sa_region"
  },
  usualResidentialAddress: {
    addressLine1: "ura_addressline1",
    addressLine2: "ura_addressline2",
    careOf: "ura_careof",
    country: "ura_country",
    locality: "ura_locality",
    poBox: "ura_pobox",
    postalCode: "ura_postcode",
    premises: "ura_premises",
    region: "ura_region"
  }
}];

const corporateTrusteeDataMock = [{
  hashedTrusteeId: "123",
  trusteeName: "trust_name",
  registerLocation: "register_location",
  registrationNumber: "registration_number",
  lawGoverned: "law_governed",
  legalForm: "legal_form",
  onRegisterInCountryFormedIn: "Y",
  corporateIndicator: "Y",
  trusteeTypeId: "50002",
  appointmentDate: "2020-02-20",
  ceasedDate: "2020-02-20",
  serviceAddress: {
    addressLine1: "sa_addressline1",
    addressLine2: "sa_addressline2",
    careOf: "sa_careof",
    country: "sa_country",
    locality: "sa_locality",
    poBox: "sa_pobox",
    postalCode: "sa_postcode",
    premises: "sa_premises",
    region: "sa_region"
  },
  registeredOfficeAddress: {
    addressLine1: "ro_addressline1",
    addressLine2: "ro_addressline2",
    careOf: "ro_careof",
    country: "ro_country",
    locality: "ro_locality",
    poBox: "ro_pobox",
    postalCode: "ro_postcode",
    premises: "ro_premises",
    region: "ro_region"
  }
}];

describe(`Get trust data service suite`, () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('getTrustData should return TrusData[] from response when api response status is 200', async () => {
    const mockResponse = { httpStatusCode: 200, resource: trustDataMock };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getTrustData(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, trustDataFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(trustDataMock);
  });

  test('getTrustData should return undefined when api response status is 404', async () => {
    const mockResponse = { httpStatusCode: 404, resource: undefined };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getTrustData(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, trustDataFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(undefined);
  });

  test('getTrustData should throw when api response status is 500', async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };

    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await expect(getTrustData(req, transactionId, overseasEntityId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });

  test('getTrustLinks should return TrustLinks[] from response when api response status is 200', async () => {
    const mockResponse = { httpStatusCode: 200, resource: trustLinksMock };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getTrustLinks(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, trustLinksFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(trustLinksMock);
  });

  test('getTrustLinks should return undefined when api response status is 404', async () => {
    const mockResponse = { httpStatusCode: 404, resource: undefined };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getTrustLinks(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, trustLinksFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(undefined);
  });

  test('getTrustLinks should throw when api response status is 500', async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };

    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await expect(getTrustLinks(req, transactionId, overseasEntityId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });

  test('getIndividualTrustees should return IndividualTrusteeData[] from response when api response status is 200', async () => {
    const mockResponse = { httpStatusCode: 200, resource: IndividualTrusteeDataMock };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getIndividualTrustees(req, transactionId, overseasEntityId, trustId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, individualTrusteesFunctionName, req, session, transactionId, overseasEntityId, trustId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(IndividualTrusteeDataMock);
  });

  test('getIndividualTrustees should return undefined when api response status is 404', async () => {
    const mockResponse = { httpStatusCode: 404, resource: undefined };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getIndividualTrustees(req, transactionId, overseasEntityId, trustId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, individualTrusteesFunctionName, req, session, transactionId, overseasEntityId, trustId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(undefined);
  });

  test('getIndividualTrustees should throw when api response status is 500', async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect(getIndividualTrustees(req, transactionId, overseasEntityId, trustId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });

  test('getCorporateTrustees should return CorporateTrusteeData[] from response when api response status is 200', async () => {
    const mockResponse = { httpStatusCode: 200, resource: corporateTrusteeDataMock };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getCorporateTrustees(req, transactionId, overseasEntityId, trustId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, corporateTrusteesFunctionName, req, session, transactionId, overseasEntityId, trustId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(corporateTrusteeDataMock);
  });

  test('getCorporateTrustees should return undefined when api response status is 404', async () => {
    const mockResponse = { httpStatusCode: 404, resource: undefined };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getCorporateTrustees(req, transactionId, overseasEntityId, trustId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, corporateTrusteesFunctionName, req, session, transactionId, overseasEntityId, trustId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(undefined);
  });

  test('getCorporateTrustees should throw when api response status is 500', async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect(getCorporateTrustees(req, transactionId, overseasEntityId, trustId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });
});
