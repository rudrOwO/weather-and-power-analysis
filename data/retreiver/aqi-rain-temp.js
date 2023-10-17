import { writeFileSync } from "fs"
import { guardAgainstInvalidInputs, reformatDate } from "./utils.js"
import { coordinates } from "./utils.js"

const [_, __, area, fromDate, toDate] = process.argv
guardAgainstInvalidInputs(area, fromDate, toDate)

/**
 * @typedef {{time: string[], us_aqi: number[]}} HourlyAQI
 * @returns {Promise<HourlyAQI>}
 */
export const retreiveHourlyAQI = async (area, fromDate, toDate) => {
  fromDate = reformatDate(fromDate)
  toDate = reformatDate(toDate)
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coordinates[area].latitute}&longitude=${coordinates[area].longitude}&start_date=${fromDate}&end_date=${toDate}&hourly=us_aqi&timezone=auto`
  const response = await fetch(url)

  console.log("Open Meteo Air Quality API response status: ", response.status)

  const { hourly } = await response.json()
  return hourly
}

/**
 * @typedef {Object} Record
 * @property {string} date
 * @property {string} demand
 * @property {string} loadShed
 * @property {string} rainfall
 * @property {string} apparent_temperature
 */
/**
 * @param {string} fromDate is in the format DD/MM/YYYY.
 * @param {string} toDate is in the format DD/MM/YYYY.
 * @returns {Promise<Record[]>} The combined records.
 */
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
  writeFileSync(
    `../daily-weather-power/${area}/${reformatDate(fromDate)}-${reformatDate(toDate)}.csv`,
    csv
  )
}

combineWeatherWithPower(area, fromDate, toDate)
