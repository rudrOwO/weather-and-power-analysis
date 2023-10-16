import { parse } from "node-html-parser"
import { reformatDate } from "./utils.js"

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

/**
 * Represents daily power statistics.
 * @typedef {{date: string, demand: string, loadShed: string}} DailyPowerStats
 * @returns {Promise<DailyPowerStats[]>} The daily power statistics.
 */
export const retreiveDailyPowerStats = async (area, fromDate, toDate) => {
  const payload = new FormData()
  payload.append("area", namesToAreaCodes[area])
  payload.append("from_date", fromDate)
  payload.append("to_date", toDate)

  const response = await fetch("http://119.40.95.168/bpdb/index.php/area_wise_demand_search", {
    method: "POST",
    body: payload,
  })

  console.log("Power Board Server response status: ", response.status)

  const html = await response.text()
  const tableData = parse(html).getElementsByTagName("td")
  const records = []

  for (let i = 3; i < tableData.length; i += 7) {
    const date = reformatDate(tableData[i].textContent.substring(24, 34))
    const demand = tableData[i + 2].textContent
    const loadShed = tableData[i + 3].textContent

    records.push({ date, demand, loadShed })
  }

  records.sort((a, b) => (a.date > b.date ? 1 : -1))
  return records
}

/**
 * @typedef {Object} DailyWeather - Represents daily rainfall statistics.
 * @property {string[]} time - Array of dates in the form YYYY-MM-DD.
 * @property {string[]} rain_sum - Array of rainfalls.
 * @property {string[]} apparent_temperature_mean - Array of apparent temperatures.
 * /
 /**
 * @returns {Promise<DailyWeather>} The book object.
 */
export const retreiveDailyWeather = async (area, fromDate, toDate) => {
  fromDate = reformatDate(fromDate)
  toDate = reformatDate(toDate)
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coordinates[area].latitute}&longitude=${coordinates[area].longitude}&start_date=${fromDate}&end_date=${toDate}&daily=apparent_temperature_mean,rain_sum&timezone=auto`
  const response = await fetch(url)

  console.log("Open Meteo API response status: ", response.status)

  const { daily } = await response.json()
  return daily
}
