export interface Navigation {
  [x: string]: {
    currentPage: string;
    previousPage: string;
    nextPage: string[];
  };
}
