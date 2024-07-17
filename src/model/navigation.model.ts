export interface Navigation {
  [x: string]: {
    currentPage: string;
    previousPage: Function;
    nextPage: string[];
  };
}
