
export const companyProfileQueryMock = {
  companyName: "Test1",
  companyNumber: "OE111129"
};

export const testDateOfCreation = "1/1/2023";
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
    date_of_creation: testDateOfCreation
  }
};
