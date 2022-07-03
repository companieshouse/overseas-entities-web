import { ApplicationData } from "./application.model";

export interface Navigation {
  [x: string]: {
    currentPage: string;
    previousPage: ((data: ApplicationData) => string);
    nextPage: string[];
  };
}
