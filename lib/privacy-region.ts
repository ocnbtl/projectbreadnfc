const US_REGIONS = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));
// Vercel supplies ISO 3166-1 alpha-2 codes. Reject placeholders and malformed locations.
const COUNTRIES = new Set(("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
  "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
  "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
  "NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ " +
  "TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW").split(" "));
// EEA and its individually coded EU territories, UK, Switzerland, and mainland China
// (US analytics processing). Canada is evaluated at province level below.
const PRIOR_CHOICE = new Set("AT BE BG HR CY CZ DE DK EE ES FI FR GR HU IE IT LT LU LV MT NL PL PT RO SE SI SK IS LI NO AX GF GP MF MQ RE YT GB CH BR TR CN".split(" "));
const CA_REGIONS = new Set("AB BC MB NB NL NS NT NU ON PE QC SK YT".split(" "));
// Conservative replay-specific hold for all-party/mixed recording-law states.
// This is not a declaration that every statute applies to masked public replay.
const REPLAY_PRIOR_CHOICE = new Set("CA CT DE FL IL MD MA MI MT NV NH PA WA".split(" "));
export function regionPolicy(trusted: boolean, country: string | null, region: string | null) {
  const known = trusted && COUNTRIES.has(country ?? "") && (country !== "US" || US_REGIONS.has(region ?? "")) && (country !== "CA" || CA_REGIONS.has(region ?? ""));
  const prior = PRIOR_CHOICE.has(country ?? "") || (country === "CA" && region === "QC");
  return { jurisdiction: !known ? "unknown" : prior ? "prior-consent" : "default-on-permitted",
    replayRequiresConsent: country === "CA" || (country === "US" && REPLAY_PRIOR_CHOICE.has(region ?? "")),
    blocked: country === "CN" };
}
