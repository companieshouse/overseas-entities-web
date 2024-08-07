import { InputDate } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { lowerCaseAllWordsExceptFirstLetters, mapBOIndividualName, mapDateOfBirth, mapInputDate, splitOriginatingRegistryName } from "../../../src/utils/update/mapper.utils";

describe("Test mapping utils", () => {
  test("does map date of creation for month format containing single digit ", () => {
    const InputDate = mapInputDate("2022-7-21");
    expect(InputDate).toEqual({ day: "21", month: "7", year: "2022" });
  });

  test("does map date of creation for day format containing single digit ", () => {
    const InputDate = mapInputDate("2022-7-01");
    expect(InputDate).toEqual({ day: "1", month: "7", year: "2022" });
  });

  test("does map date of creation for month format containing two digits", () => {
    const InputDate = mapInputDate("2022-12-21");
    expect(InputDate).toEqual({ day: "21", month: "12", year: "2022" });
  });

  test("does map date of creation and strips leading 0", () => {
    const InputDate = mapInputDate("2022-07-21");
    expect(InputDate).toEqual({ day: "21", month: "7", year: "2022" });
  });

  test("returns undefined for undefined date", () => {
    const InputDate = mapInputDate(undefined);
    expect(InputDate).toEqual(undefined);
  });

  test("returns empty string for date with month and year", () => {
    const InputDate = mapInputDate("2022-07");
    expect(InputDate).toEqual({ day: "", month: "7", year: "2022" });
  });

  test("mapInputDate trims timestamp off string date", () => {
    const InputDate = mapInputDate("1979-04-19 00:00:000");
    expect(InputDate).toEqual({ day: "19", month: "4", year: "1979" });
  });

  test("returns string for name with forename and middlename", () => {
    const nameElements = { forename: "First", middleName: "middle", surname: "surname" };
    const firstName = mapBOIndividualName(nameElements);
    expect(firstName).toEqual("First middle");
  });

  test("returns string for name with forename and empty middlename", () => {
    const nameElements = { forename: "First", middleName: " ", surname: "surname" };
    const firstName = mapBOIndividualName(nameElements);
    expect(firstName).toEqual("First");
  });

  test("returns string for name with forename and undefined middlename", () => {
    const nameElements = { forename: "First", surname: "surname" };
    const firstName = mapBOIndividualName(nameElements);
    expect(firstName).toEqual("First");
  });

  describe("mapDateOfBirth", () => {
    it("should return the same as the input", () => {
      const date = {
        day: "05",
        month: "08",
        year: "1983"
      };
      const dateMapped = mapDateOfBirth(date);
      expect(dateMapped).toEqual({ day: "05", month: "08", year: "1983" });
    });

    it("should add the zero to the day", () => {
      const date = {
        day: "5",
        month: "08",
        year: "1983"
      };
      const dateMapped = mapDateOfBirth(date);
      expect(dateMapped).toEqual({ day: "05", month: "08", year: "1983" });
    });

    it("should add the zero to the day and convert it to a string", () => {
      const date = {
        day: 5,
        month: "08",
        year: "1983"
      };
      const dateMapped = mapDateOfBirth(date as unknown as InputDate);
      expect(dateMapped).toEqual({ day: "05", month: "08", year: "1983" });
    });

    it("should add the zero to the month", () => {
      const date = {
        day: "05",
        month: "8",
        year: "1983"
      };
      const dateMapped = mapDateOfBirth(date);
      expect(dateMapped).toEqual({ day: "05", month: "08", year: "1983" });
    });

    it("should add the zero to the day and convert it to a string", () => {
      const date = {
        day: "05",
        month: 8,
        year: "1983"
      };
      const dateMapped = mapDateOfBirth(date as unknown as InputDate);
      expect(dateMapped).toEqual({ day: "05", month: "08", year: "1983" });
    });
  });

  describe("lowerCaseAllWordsExceptFirstLetters", () => {
    test.each([
      ["FRANCE", "France"],
      ["BOSNIA AND HERZEGOVINA", "Bosnia and Herzegovina"],
      ["ISLE OF MAN", "Isle of Man"],
      ["SAINT VINCENT AND THE GRENADINES", "Saint Vincent and the Grenadines"],
      ["BRITISH INDIAN OCEAN TERRITORY", "British Indian Ocean Territory"],
      ["SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA", "Saint Helena, Ascension and Tristan da Cunha"],
      ["SINT MAARTEN (DUTCH PART)", "Sint Maarten (Dutch part)"],
      ["GUINEA-BISSAU", "Guinea-Bissau"],
      ["Svalbard And Jan Mayen", "Svalbard and Jan Mayen"],
      ["Saint Helena, Ascension And Tristan Da Cunha", "Saint Helena, Ascension and Tristan da Cunha"],
      ["Isle Of Mann", "Isle of Mann"],
      ["Sint Maarten (Dutch Part)", "Sint Maarten (Dutch part)"],
      ["Congo, The Democratic Republic Of The", "Congo, the Democratic Republic of the"],
      ["Saint Vincent And The Grenadines", "Saint Vincent and the Grenadines"],
      ["South Georgia And The South Sandwich Islands", "South Georgia and the South Sandwich Islands"],
      ["Heard Island And Mcdonald Islands", "Heard Island and McDonald Islands"],
    ])(`Correctly reformats %s`, (str, expectedResult) => {
      expect(lowerCaseAllWordsExceptFirstLetters(str)).toEqual(expectedResult);
    });
  });

  describe("splitOriginatingRegistryName", () => {
    test.each([
      [
        "Undefined returns empty strings",
        undefined,
        { registryName: "", jurisdiction: "" }
      ],
      [
        "Empty string returns empty strings",
        "",
        { registryName: "", jurisdiction: "" }
      ],
      [
        "No comma returns correctly",
        "Public Register Name",
        { registryName: "Public Register Name", jurisdiction: "" }
      ],
      [
        "One comma occurence splits correctly",
        "Public Register Name,Country",
        { registryName: "Public Register Name", jurisdiction: "Country" }
      ],
      [
        "Multiple comma occurences in country splits correctly",
        "Public Register Name, Virgin Islands, U.S.",
        { registryName: "Public Register Name", jurisdiction: "Virgin Islands, U.S." }
      ],
      [
        "Leading whitespace on country is removed",
        "Public Register Name, Country",
        { registryName: "Public Register Name", jurisdiction: "Country" }
      ]
    ])(`%s`, (_, stringToSplit, expectedResult) => {

      expect(splitOriginatingRegistryName(stringToSplit as string)).toEqual(expectedResult);
    });
  });

  describe("Test all known countries", () => {
    test("maps all countries from uppercase correctly", () => {
      const countries = [
        "Afghanistan",
        "Aland Islands",
        "Albania",
        "Alderney",
        "Algeria",
        "American Samoa",
        "Andorra",
        "Angola",
        "Anguilla",
        "Antarctica",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Aruba",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bermuda",
        "Bhutan",
        "Bolivia",
        "Bonaire, Sint Eustatius and Saba",
        "Bosnia and Herzegovina",
        "Botswana",
        "Bouvet Island",
        "Brazil",
        "British Indian Ocean Territory",
        "Brunei Darussalam",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Cape Verde",
        "Cayman Islands",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Christmas Island",
        "Cocos (Keeling) Islands",
        "Colombia",
        "Comoros",
        "Congo",
        "Congo, the Democratic Republic of the",
        "Cook Islands",
        "Costa Rica",
        "Croatia",
        "Cuba",
        "Curacao",
        "Cyprus",
        "Czech Republic",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "East Timor",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "England",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Eswatini",
        "Ethiopia",
        "Falkland Islands",
        "Faroe Islands",
        "Fiji",
        "Finland",
        "France",
        "French Guiana",
        "French Polynesia",
        "French Southern Territories",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Gibraltar",
        "Greece",
        "Greenland",
        "Grenada",
        "Guadeloupe",
        "Guam",
        "Guatemala",
        "Guernsey",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Heard Island and McDonald Islands",
        "Herm",
        "Honduras",
        "Hong Kong",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran",
        "Iraq",
        "Ireland",
        "Isle of Man",
        "Israel",
        "Italy",
        "Ivory Coast",
        "Jamaica",
        "Japan",
        "Jersey",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Kosovo",
        "Kuwait",
        "Kyrgyzstan",
        "Laos",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Macao",
        "Macedonia",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Martinique",
        "Mauritania",
        "Mauritius",
        "Mayotte",
        "Mexico",
        "Micronesia",
        "Moldova",
        "Monaco",
        "Mongolia",
        "Montenegro",
        "Montserrat",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "New Caledonia",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "Niue",
        "Norfolk Island",
        "North Korea",
        "Northern Ireland",
        "Northern Mariana Islands",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestine, State of",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Pitcairn",
        "Poland",
        "Portugal",
        "Puerto Rico",
        "Qatar",
        "Reunion",
        "Romania",
        "Russia",
        "Rwanda",
        "Saint Barthelemy",
        "Saint Helena, Ascension and Tristan da Cunha",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Martin (French part)",
        "Saint Pierre and Miquelon",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Sark",
        "Saudi Arabia",
        "Scotland",
        "Senegal",
        "Serbia",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Sint Maarten (Dutch part)",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "South Africa",
        "South Georgia and the South Sandwich Islands",
        "South Korea",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Svalbard and Jan Mayen",
        "Sweden",
        "Switzerland",
        "Syria",
        "Taiwan",
        "Tajikistan",
        "Tanzania",
        "Thailand",
        "Togo",
        "Tokelau",
        "Tonga",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Turks and Caicos Islands",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "United States",
        "United States Minor Outlying Islands",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Vatican City",
        "Venezuela",
        "Vietnam",
        "Virgin Islands, British",
        "Virgin Islands, U.S.",
        "Wales",
        "Wallis and Futuna",
        "Western Sahara",
        "Yemen",
        "Zambia",
        "Zimbabwe",
      ];
      expect(countries.every(c =>
        c === lowerCaseAllWordsExceptFirstLetters(c.toUpperCase())
      )).toBeTruthy();
    });
  });

  describe("Test all known nationalities", () => {
    test("maps all nationalities from uppercase correctly", () => {
      const nationalities = [
        "Afghan",
        "Albanian",
        "Algerian",
        "American",
        "Andorran",
        "Angolan",
        "Anguillan",
        "Argentine",
        "Armenian",
        "Australian",
        "Austrian",
        "Azerbaijani",
        "Bahamian",
        "Bahraini",
        "Bangladeshi",
        "Barbadian",
        "Belarusian",
        "Belgian",
        "Belizean",
        "Beninese",
        "Bermudian",
        "Bhutanese",
        "Bolivian",
        "Botswanan",
        "Brazilian",
        "British",
        "British Virgin Islander",
        "Bruneian",
        "Bulgarian",
        "Burkinan",
        "Burmese",
        "Burundian",
        "Cambodian",
        "Cameroonian",
        "Canadian",
        "Cape Verdean",
        "Cayman Islander",
        "Central African",
        "Chadian",
        "Chilean",
        "Chinese",
        "Citizen of Antigua and Barbuda",
        "Citizen of Bosnia and Herzegovina",
        "Citizen of Guinea-Bissau",
        "Citizen of Kiribati",
        "Citizen of Seychelles",
        "Citizen of the Dominican Republic",
        "Citizen of Vanuatu",
        "Colombian",
        "Comoran",
        "Congolese (Congo)",
        "Congolese (DRC)",
        "Cook Islander",
        "Costa Rican",
        "Croatian",
        "Cuban",
        "Cymraes",
        "Cymro",
        "Cypriot",
        "Czech",
        "Danish",
        "Djiboutian",
        "Dominican",
        "Dutch",
        "East Timorese",
        "Ecuadorean",
        "Egyptian",
        "Emirati",
        "English",
        "Equatorial Guinean",
        "Eritrean",
        "Estonian",
        "Ethiopian",
        "Faroese",
        "Fijian",
        "Filipino",
        "Finnish",
        "French",
        "Gabonese",
        "Gambian",
        "Georgian",
        "German",
        "Ghanaian",
        "Gibraltarian",
        "Greek",
        "Greenlandic",
        "Grenadian",
        "Guamanian",
        "Guatemalan",
        "Guinean",
        "Guyanese",
        "Haitian",
        "Honduran",
        "Hong Konger",
        "Hungarian",
        "Icelandic",
        "Indian",
        "Indonesian",
        "Iranian",
        "Iraqi",
        "Irish",
        "Israeli",
        "Italian",
        "Ivorian",
        "Jamaican",
        "Japanese",
        "Jordanian",
        "Kazakh",
        "Kenyan",
        "Kittitian",
        "Kosovan",
        "Kuwaiti",
        "Kyrgyz",
        "Lao",
        "Latvian",
        "Lebanese",
        "Liberian",
        "Libyan",
        "Liechtenstein citizen",
        "Lithuanian",
        "Luxembourger",
        "Macanese",
        "Macedonian",
        "Malagasy",
        "Malawian",
        "Malaysian",
        "Maldivian",
        "Malian",
        "Maltese",
        "Marshallese",
        "Martiniquais",
        "Mauritanian",
        "Mauritian",
        "Mexican",
        "Micronesian",
        "Moldovan",
        "Monegasque",
        "Mongolian",
        "Montenegrin",
        "Montserratian",
        "Moroccan",
        "Mosotho",
        "Mozambican",
        "Namibian",
        "Nauruan",
        "Nepalese",
        "New Zealander",
        "Nicaraguan",
        "Nigerian",
        "Nigerien",
        "Niuean",
        "North Korean",
        "Northern Irish",
        "Norwegian",
        "Omani",
        "Pakistani",
        "Palauan",
        "Palestinian",
        "Panamanian",
        "Papua New Guinean",
        "Paraguayan",
        "Peruvian",
        "Pitcairn Islander",
        "Polish",
        "Portuguese",
        "Prydeinig",
        "Puerto Rican",
        "Qatari",
        "Romanian",
        "Russian",
        "Rwandan",
        "Salvadorean",
        "Sammarinese",
        "Samoan",
        "Sao Tomean",
        "Saudi Arabian",
        "Scottish",
        "Senegalese",
        "Serbian",
        "Sierra Leonean",
        "Singaporean",
        "Slovak",
        "Slovenian",
        "Solomon Islander",
        "Somali",
        "South African",
        "South Korean",
        "South Sudanese",
        "Spanish",
        "Sri Lankan",
        "St Helenian",
        "St Lucian",
        "Stateless",
        "Sudanese",
        "Surinamese",
        "Swazi",
        "Swedish",
        "Swiss",
        "Syrian",
        "Taiwanese",
        "Tajik",
        "Tanzanian",
        "Thai",
        "Togolese",
        "Tongan",
        "Trinidadian",
        "Tristanian",
        "Tunisian",
        "Turkish",
        "Turkmen",
        "Turks and Caicos Islander",
        "Tuvaluan",
        "Ugandan",
        "Ukrainian",
        "Uruguayan",
        "Uzbek",
        "Vatican citizen",
        "Venezuelan",
        "Vietnamese",
        "Vincentian",
        "Wallisian",
        "Welsh",
        "Yemeni",
        "Zambian",
        "Zimbabwean"
      ];
      expect(nationalities.every(c =>
        c === lowerCaseAllWordsExceptFirstLetters(c.toUpperCase())
      )).toBeTruthy();
    });
  });
});
