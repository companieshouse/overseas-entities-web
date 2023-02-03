import { ApplicationData, resetEntityUpdate } from "../../src/model";
import { describe, expect, test } from '@jest/globals';
import { WhoIsRegisteringType } from "../../src/model/who.is.making.filing.model";

describe("reset update model", () => {

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

  test("does reset presenter in empty model", () => {
    const appData: ApplicationData = {
    };
    resetEntityUpdate(appData);
    expect(appData.presenter).toEqual({});
  });

  test("does reset presenter in model", () => {
    const appData: ApplicationData = {
      presenter: {
        full_name: "John Doe",
        email: "john.doe@test.com"
      }
    };
    resetEntityUpdate(appData);
    expect(appData.presenter).toEqual({});
  });

  test("does reset due diligence in empty model", () => {
    const appData: ApplicationData = {
    };
    resetEntityUpdate(appData);
    expect(appData.due_diligence).toEqual({});
  });

  test("does reset due diligence in model", () => {
    const appData: ApplicationData = {
      due_diligence: {
        name: "Alice Keys"
      }
    };
    resetEntityUpdate(appData);
    expect(appData.due_diligence).toEqual({});
  });

  test("does reset overseas entity due diligence in empty model", () => {
    const appData: ApplicationData = {
    };
    resetEntityUpdate(appData);
    expect(appData.overseas_entity_due_diligence).toEqual({});
  });

  test("does reset overseas entity due diligence in model", () => {
    const appData: ApplicationData = {
      due_diligence: {
        name: "Alice Keys"
      }
    };
    resetEntityUpdate(appData);
    expect(appData.overseas_entity_due_diligence).toEqual({});
  });

  test("does reset who is registering in empty model", () => {
    const appData: ApplicationData = {
    };
    resetEntityUpdate(appData);
    expect(appData.who_is_registering).toBeUndefined();
  });

  test("does reset who is registering in model", () => {
    const appData: ApplicationData = {
      who_is_registering: WhoIsRegisteringType.AGENT
    };
    resetEntityUpdate(appData);
    expect(appData.who_is_registering).toBeUndefined();
  });

  test("does reset in model", () => {
    const appData: ApplicationData = {
      who_is_registering: WhoIsRegisteringType.AGENT
    };
    resetEntityUpdate(appData);
    expect(appData.payment).toBeUndefined();
    expect(appData.overseas_entity_id).toBeUndefined();
    expect(appData.transaction_id).toBeUndefined();
    expect(appData.trusts).toBeUndefined();
    expect(appData.beneficial_owners_statement).toBeUndefined();
    expect(appData.beneficial_owners_individual).toBeUndefined();
    expect(appData.beneficial_owners_corporate).toBeUndefined();
    expect(appData.beneficial_owners_government_or_public_authority).toBeUndefined();
    expect(appData.managing_officers_individual).toBeUndefined();
    expect(appData.managing_officers_corporate).toBeUndefined();
  });
});

