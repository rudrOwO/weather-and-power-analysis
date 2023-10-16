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

/**
 * Represents daily power statistics.
 * @typedef {Object} DailyPowerStats
 * @property {string} date - The date in the format DD/MM/YYYY.
 * @property {string} demand - The demand in megawatts.
 * @property {string} loadShed - The load shedding in megawatts.
 */

/**
 * @returns {Promise<DailyPowerStats[]>} The book object.
 */
export const retreiveDailyPowerStats = async (area, fromDate, toDate) => {
  const payload = new FormData()
  payload.append("area", namesToAreaCodes[area])
  payload.append("from_date", fromDate)
  payload.append("to_date", toDate)

  const response = await fetch(
    "http://119.40.95.168/bpdb/index.php/area_wise_demand_search",
    {
      method: "POST",
      body: payload,
    }
  )

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
