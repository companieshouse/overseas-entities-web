import { ApplicationData, resetEntityUpdate } from "../../src/model";
import { describe, expect, test } from '@jest/globals';

describe("reet update model", () => {

  test("does reset update in empty model", () => {
    const appData: ApplicationData = {
    };
    const update = resetEntityUpdate(appData);
    expect(update).toEqual({});
    expect(appData.update).toEqual({});
  });

  test("does reset update in model", () => {
    const appData: ApplicationData = {
      update: {
        date_of_creation: "1/1/2023"
      }
    };
    const update = resetEntityUpdate(appData);
    expect(update).toEqual({});
    expect(appData.update).toEqual({});
  });
});
