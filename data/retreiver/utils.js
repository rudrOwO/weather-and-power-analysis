export const namesToAreaCodes = {
  dhaka: "1",
  chittagong: "2",
  khulna: "3",
  rajshahi: "4",
  comilla: "5",
  mymensingh: "6",
  sylhet: "7",
  barisal: "8",
  rangpur: "9",
}

export const coordinates = {
  dhaka: {
    latitute: 23.7104,
    longitude: 90.4074,
  },
  chittagong: {
    latitute: 22.3384,
    longitude: 91.8317,
  },
  khulna: {
    latitute: 22.8098,
    longitude: 89.5644,
  },
  rajshahi: {
    latitute: 24.374,
    longitude: 88.6011,
  },
  comilla: {
    latitute: 23.4619,
    longitude: 91.185,
  },
  mymensingh: {
    latitute: 24.7564,
    longitude: 90.4065,
  },
  sylhet: {
    latitute: 24.899,
    longitude: 91.872,
  },
  barisal: {
    latitute: 22.705,
    longitude: 90.3701,
  },
  rangpur: {
    latitute: 25.7466,
    longitude: 89.2517,
  },
}

export const reformatDate = {
  "yyyy-mm-dd to dd/mm/yyyy": (date) => {
    const [year, month, day] = date.split("-")
    return `${day}/${month}/${year}`
  },

  "dd/mm/yyyy to yyyy-mm-dd": (date) => {
    const [day, month, year] = date.split("/")
    return `${year}-${month}-${day}`
  },
}

export const guardAgainstInvalidInputs = (area, fromDate, toDate) => {
  if (area === undefined || fromDate === undefined || toDate === undefined) {
    console.error("Usage: node script.js <area> <starting date> <ending date>")
    console.log("Example: node script.js dhaka 2016-01-01 2016-12-31")
    process.exit(1)
  }

  if (namesToAreaCodes[area] === undefined) {
    console.error("Invalid area name")
    process.exit(1)
  }
}
