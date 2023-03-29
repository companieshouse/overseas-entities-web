import { FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME } from "../../src/config";
import {
  CONTINUE_BUTTON_TEXT,
  SAVE_AND_CONTINUE_BUTTON_TEXT
} from '../__mocks__/text.mock';

export const saveAndContinueButtonText = FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME === "true" ? SAVE_AND_CONTINUE_BUTTON_TEXT : CONTINUE_BUTTON_TEXT;
