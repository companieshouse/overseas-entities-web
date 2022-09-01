export const UK_COUNTRIES = ["United Kingdom", "England", "Wales", "Scotland", "Northern Ireland"];

// Used to remove UK countries from incorporation_country field on overseas entity nunjucks file
export const countryFilter = (c) => UK_COUNTRIES.indexOf(c.value) === -1;
