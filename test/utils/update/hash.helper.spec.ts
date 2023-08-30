import { encode } from "../../../src/utils/update/hash.helper";

describe("hash helper test", () => {
  test ('test', () => {

    const inputString = '9001809816';

    const result = encode(inputString) ;

    expect(result).toEqual("9TeildEUMY5Xnw2gbPxGO3jCod8");
  });
});
