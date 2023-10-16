import { guardAgainstInvalidInputs } from "./utils.js"
import {
  retreiveDailyPowerStats,
  retreiveDailyWeather,
} from "./weather-power.js"

const [_, __, area, fromDate, toDate] = process.argv
guardAgainstInvalidInputs(area, fromDate, toDate)

/**
 * @param {string} fromDate is in the format DD/MM/YYYY.
 * @param {string} toDate is in the format DD/MM/YYYY.
 */
const combineWeatherWithPower = async (area, fromDate, toDate) => {
  const [powerStats, rainfallStats] = await Promise.all([
    retreiveDailyPowerStats(area, fromDate, toDate),
    retreiveDailyWeather(area, fromDate, toDate),
  ])
}

console.log(JSON.stringify(daily, null, 2))
