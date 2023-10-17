import { parse } from "node-html-parser"
import { writeFileSync } from "fs"
import { guardAgainstInvalidInputs, reformatDate } from "./utils.js"
import { namesToAreaCodes, coordinates } from "./utils.js"

const [_, __, area, fromDate, toDate] = process.argv
guardAgainstInvalidInputs(area, fromDate, toDate)

/**
 * Represents daily power statistics.
 * @typedef {{date: string, demand: string, loadShed: string}} DailyPowerStats
 * @returns {Promise<DailyPowerStats[]>} The daily power statistics.
 */
export const retreiveDailyPowerStats = async (area, fromDate, toDate) => {
  const payload = new FormData()
  payload.append("area", namesToAreaCodes[area])
  payload.append("from_date", reformatDate["yyyy-mm-dd to dd/mm/yyyy"](fromDate))
  payload.append("to_date", reformatDate["yyyy-mm-dd to dd/mm/yyyy"](toDate))

  const response = await fetch("http://119.40.95.168/bpdb/index.php/area_wise_demand_search", {
    method: "POST",
    body: payload,
  })

  console.log("Power Board Server response status: ", response.status)

  const html = await response.text()
  const tableData = parse(html).getElementsByTagName("td")
  const records = []

  for (let i = 3; i < tableData.length; i += 7) {
    const date = reformatDate["dd/mm/yyyy to yyyy-mm-dd"](
      tableData[i].textContent.substring(24, 34)
    )
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
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coordinates[area].latitute}&longitude=${coordinates[area].longitude}&start_date=${fromDate}&end_date=${toDate}&daily=apparent_temperature_mean,rain_sum&timezone=auto`
  const response = await fetch(url)

  console.log("Open Meteo API response status: ", response.status)

  const { daily } = await response.json()
  return daily
}

const combineWeatherWithPower = async (area, fromDate, toDate) => {
  const [powerStats, weatherStats] = await Promise.all([
    retreiveDailyPowerStats(area, fromDate, toDate),
    retreiveDailyWeather(area, fromDate, toDate),
  ])

  const len = weatherStats.time.length
  const combinedRecords = new Array(len)

  for (let i = 0, j = 0; i < len; i++) {
    // Handling missing records in Power dataset
    if (powerStats[j].date === weatherStats.time[i]) {
      combinedRecords[i] = {
        date: weatherStats.time[i],
        demand: powerStats[j].demand,
        loadShed: powerStats[j].loadShed,
        rainfall: weatherStats.rain_sum[i],
        apparent_temperature: weatherStats.apparent_temperature_mean[i],
      }
      j++
    } else {
      console.log("Missing power stats for: ", weatherStats.time[i])
      combinedRecords[i] = {
        date: weatherStats.time[i],
        demand: "",
        loadShed: "",
        rainfall: weatherStats.rain_sum[i],
        apparent_temperature: weatherStats.apparent_temperature_mean[i],
      }
    }
  }

  const header = "date,power_demand,load_shed,rainfall,mean_apparent_temperature\n"
  const rows = combinedRecords.map((record) => {
    return `${record.date},${record.demand},${record.loadShed},${record.rainfall},${record.apparent_temperature}\n`
  })
  const csv = header + rows.join("")
  writeFileSync(`../daily-weather-power/${area}/${fromDate}-${toDate}.csv`, csv)
}

combineWeatherWithPower(area, fromDate, toDate)
