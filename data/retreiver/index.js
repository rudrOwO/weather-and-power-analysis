import { guardAgainstInvalidInputs } from "./utils.js"
import {
  retreiveDailyPowerStats,
  retreiveDailyWeather,
} from "./weather-power.js"

const [_, __, area, fromDate, toDate] = process.argv
guardAgainstInvalidInputs(area, fromDate, toDate)

/**
 * @typedef {Object} Record
 * @property {string} date
 * @property {string} demand
 * @property {string} loadShed
 * @property {string} rainfall
 * @property {string} temperature
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

  const combinedRecords = []
  const len = weatherStats.time.length
  for (let i = 0; i < len; i++) {
    while (powerStats[i].date !== weatherStats.time[i]) {
      i++
    }
  }
}

console.log(
  JSON.stringify(
    await combineWeatherWithPower(area, fromDate, toDate),
    null,
    2
  )
)
