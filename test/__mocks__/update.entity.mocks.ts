import { DATE } from "./fields/date.mock";
export const testDateOfCreation = DATE;
export const testFilingDate = DATE;
export const testEntityName = "testEntity";
export const testEntityNumber = "OE111129";
export const testIncorporationCountry = "Ireland";

export const entityProfileModelMock = {
  entity_name: testEntityName,
  entity_number: testEntityNumber,
  entity: {
    principal_address: {
      property_name_number: "123456",
      line_1: "abcxyz",
      country: "UK"
    },
    incorporation_country: testIncorporationCountry
  },
  update: {
    date_of_creation: testDateOfCreation
  }
};

export const entityModelMock = {
  entity_name: testEntityName,
  entity_number: testEntityNumber,
  entity: {
    principal_address: {
      property_name_number: "123456",
      line_1: "abcxyz",
      country: "UK"
    }
  }
};

export const missingDateOfCreationMock = {
  entity_name: testEntityName,
  entity_number: testEntityNumber,
  entity: {
    principal_address: {
      property_name_number: "123456",
      line_1: "abcxyz",
      country: "UK"
    }
  },
  update: {
  }
};

export const updateModelMock = {
  update: {
    date_of_creation: testDateOfCreation,
    filing_date: testFilingDate
  }
};

export const companyProfileQueryMock = {
  companyName: testEntityName,
  companyNumber: testEntityNumber,
  dateOfCreation: "2000-01-01",
  foreignCompanyDetails: {
    originatingRegistry: {
      country: testIncorporationCountry
    }
  }
};

export const entityCookieUpdateMock = {
  "entity_number": testEntityNumber,
};
export const entityCookieRemoveMock = {
  remove: {
    is_listed_as_property_owner: "1",
    has_sold_all_land: "0",
    is_not_proprietor_of_land: false,
  }
};
