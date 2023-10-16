import { reformatDate } from "./utils.js"

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

/**
 * Represents a single rainfall stat.
 * @typedef {Object} RainSum
 * @property {string} value - The rain sum in millimeters.
 */

/**
 * Represents daily rainfall statistics.
 * @typedef {Object} DailyRainfall
 * @property {string[]} time - Array of dates in the form YYYY-MM-DD.
 * @property {RainSum[]} rain_sum - Array of rainfalls.
 */

/**
 * @returns {Promise<DailyRainfall>} The book object.
 */
export const retreiveDailyRainfall = async (area, fromDate, toDate) => {
  fromDate = reformatDate(fromDate)
  toDate = reformatDate(toDate)
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coordinates[area].latitute}&longitude=${coordinates[area].longitude}&start_date=${fromDate}&end_date=${toDate}&daily=rain_sum&timezone=auto`
  const response = await fetch(url)
  const { daily } = await response.json()
  return daily
}
