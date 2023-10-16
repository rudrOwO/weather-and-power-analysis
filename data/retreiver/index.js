import { guardAgainstInvalidInputs } from "./utils.js"
import { retreiveDailyPowerStats, retreiveDailyWeather } from "./weather-power.js"

const [_, __, area, fromDate, toDate] = process.argv
guardAgainstInvalidInputs(area, fromDate, toDate)

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

  for (let i = 0; i < len; i++) {
    // Handling missing rows in the power stats.
    // if (powerStats[i].date > weatherStats.time[i]) {
    //   const nextSynchedDate = powerStats[i].date
    //   while (nextSynchedDate > weatherStats.time[i]) {
    //     combinedRecords[i] = {
    //       date: weatherStats.time[i],
    //       demand: "",
    //       loadShed: "",
    //       rainfall: weatherStats.rain_sum[i],
    //       apparent_temperature: weatherStats.apparent_temperature_mean[i],
    //     }
    //     i++
    //   }
    // }

    combinedRecords[i] = {
      date: weatherStats.time[i],
      demand: powerStats[i].demand,
      loadShed: powerStats[i].loadShed,
      rainfall: weatherStats.rain_sum[i],
      apparent_temperature: weatherStats.apparent_temperature_mean[i],
    }
  }

  return combinedRecords
}

console.log(JSON.stringify(await combineWeatherWithPower(area, fromDate, toDate), null, 2))
