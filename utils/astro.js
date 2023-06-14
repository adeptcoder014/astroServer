const { default: axios } = require("axios");
const ephemeris = require("../constants/urls");
//=====================================================
zodiacMetaData = [
  { sign: "aries", icon: "♈", lord: "mars", house: 1 },
  { sign: "taurus", icon: "♉", lord: "venus", house: 2 },
  { sign: "gemini", icon: "♊", lord: "mercury", house: 3 },
  { sign: "cancer", icon: "♋", lord: "moon", house: 4 },
  { sign: "leo", icon: "♌", lord: "sun", house: 5 },
  { sign: "virgo", icon: "♍", lord: "mercury", house: 6 },
  { sign: "libra", icon: "♎", lord: "venus", house: 7 },
  { sign: "scorpio", icon: "♏", lord: "mars", house: 8 },
  { sign: "sagittarius", icon: "♐", lord: "jupiter", house: 9 },
  { sign: "capricorn", icon: "♑", lord: "saturn", house: 10 },
  { sign: "aquarius", icon: "♒", lord: "saturn", house: 11 },
  { sign: "pisces", icon: "♓", lord: "jupiter", house: 12 },
];
//=====================================================

/**
 * Retrieves zodiac sign data based on the provided icon or name.
 * @param {string} icon - The icon representing the zodiac sign.
 * @param {string} name - The name of the zodiac sign.
 * @returns {object|undefined} - The zodiac sign object if found, otherwise undefined.
 */
const getZodiacData = (icon, name) => {
  if (icon) {
    const foundByIcon = zodiacMetaData.find((x) => x.icon === icon);
    if (foundByIcon) {
      return foundByIcon;
    }
  } else if (name) {
    const foundByName = zodiacMetaData.find((x) => x.sign === name);
    if (foundByName) {
      return foundByName;
    }
  }
};

//=====================================================
const getEphemeris = async () => {
  const planets = await axios.get(ephemeris.ephemerisApi + "/planets");
  const houses = await axios.get(ephemeris.ephemerisApi + "/houses");
  return { planets, houses };
};
//=====================================================
const generateZodiacCycle = (lagnaSign) => {
  const zodiacSigns = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ];

  const lagnaIndex = zodiacSigns.indexOf(lagnaSign);

  const rotatedZodiacSigns = [
    ...zodiacSigns.slice(lagnaIndex),
    ...zodiacSigns.slice(0, lagnaIndex),
  ];
  const zodiacCycle = [];
  for (let i = 0; i < 12; i++) {
    zodiacCycle.push({
      name: rotatedZodiacSigns[i],
      house: i + 1,
    });
  }

  return zodiacCycle;
};
//=====================================================
const wherePlanetIsDeposited = (
  planet,
  currentPlanetsPositions,
  newZodiacCycle
) => {
  let planetCurrentPosition = "";

  if (currentPlanetsPositions) {
    planetCurrentPosition =
      currentPlanetsPositions?.find((x) => {
        return x.name.toLowerCase() === planet.toLowerCase();
      }) ?? null;
  }

  let planetsCurrentTransitZodiacSign = getZodiacData(
    planetCurrentPosition?.position?.split(" ")[1]
  ); //--- extracting the symbol

  let houseNumber = newZodiacCycle.findIndex(
    (x) => x.name === planetsCurrentTransitZodiacSign?.sign
  );
  return houseNumber + 1;
};
//=====================================================
const anyPlanetInTheHouse = (
  house,
  currentPlanetsPositions,
  newZodiacCycle,
  planet
) => {

  let planetDeposited = [];
  planetDeposited = currentPlanetsPositions.filter(
    (x) =>
      x.position.split(" ")[1] ===
      getZodiacData(null, newZodiacCycle[house].name).icon
  );

  return planetDeposited;
};
//=====================================================
module.exports = {
  getNatal: async () => {
    const { houses, planets } = await getEphemeris();

    const ascSymbol = houses?.data?.data[0].name; //-------> only need the first house for Asc. calculation
    const currentPlanetsPositions = planets?.data?.data;

    const ascSymbolData = getZodiacData(ascSymbol);
    const newZodiacCycle = generateZodiacCycle(ascSymbolData.sign);
    //----------------------------------
    let natal = [];
    
    for (let i = 0; i < 12; i++) {
      let lord = getZodiacData(null, newZodiacCycle[i].name);
      let deposited = wherePlanetIsDeposited(
        getZodiacData(null, newZodiacCycle[i].name).lord,
        currentPlanetsPositions,
        newZodiacCycle
      );
      let anyPlanet = anyPlanetInTheHouse(
        i,
        currentPlanetsPositions,
        newZodiacCycle,
        lord.lord
      );
      natal.push({
        house: i + 1,
        sign: newZodiacCycle[i].name,
        lord: lord.lord,
        deposited: deposited,
        anyPlanet: anyPlanet,
      });
    }
    return natal;
  },
};