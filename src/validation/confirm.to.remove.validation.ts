import { body } from "express-validator";
import { DoYouWantToRemoveKey } from "../model/data.types.model";

export const confirmToRemove = [
  body(DoYouWantToRemoveKey).custom((value) => {
    if (value === undefined) {
      throw new Error("Are you sure you want to remove confirm has no value");
    }

    return true;
  })
];
