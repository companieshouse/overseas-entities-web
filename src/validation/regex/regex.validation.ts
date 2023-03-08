export const VALID_CHARACTERS = /^[-,.:; 0-9A-Z&@$£¥€'"«»''""?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$/;

// same as VALID_CHARACTERS but also allows carriage returns
export const VALID_CHARACTERS_FOR_TEXT_BOX = /^[-,.:; 0-9A-Z&@$£¥€'"«»''""?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž\r\n]*$/;

// This is the same regular expression as used by the CH account service
export const VALID_EMAIL_FORMAT = /^.+@.+\..+$/;

// Valid OE number characters
export const VALID_OE_NUMBER_FORMAT = /^OE\d{6}$/;

// Valid UK post code
export const VALID_POSTCODE = /^[A-Za-z]{1,2}[0-9R][0-9A-Z]?[\s]{0,1}[0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}$/;
