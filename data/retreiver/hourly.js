import { writeFileSync } from "fs"
import { guardAgainstInvalidInputs } from "./utils.js"
import { coordinates } from "./utils.js"

const [_, __, area, fromDate, toDate] = process.argv
guardAgainstInvalidInputs(area, fromDate, toDate)

/**
 * @typedef {{time: string[], us_aqi: number[]}} HourlyAQI
 * @returns {Promise<HourlyAQI>}
 */
export const retreiveHourlyAQI = async (area, fromDate, toDate) => {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coordinates[area].latitute}&longitude=${coordinates[area].longitude}&start_date=${fromDate}&end_date=${toDate}&hourly=us_aqi&timezone=auto`
  const response = await fetch(url)

  console.log("Open Meteo Air Quality API response status: ", response.status)

  const { hourly } = await response.json()
  return hourly
}

/**
 * @typedef {{time: string[], apparent_temperature: number[], rain: number[]}} HourlyWeather
 * @returns {Promise<HourlyWeather >}
 */
export const retreiveHourlyWeather = async (area, fromDate, toDate) => {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coordinates[area].latitute}&longitude=${coordinates[area].longitude}&start_date=${fromDate}&end_date=${toDate}&hourly=apparent_temperature,rain&timezone=auto`
  const response = await fetch(url)

  console.log("Open Meteo Weather API response status: ", response.status)

  const { hourly } = await response.json()

  // TODO Convert to daily before returning

  return hourly
}

const combineWeatherWithAQI = async (area, fromDate, toDate) => {
  const [airQualityStats, weatherStats] = await Promise.all([
    retreiveHourlyAQI(area, fromDate, toDate),
    retreiveHourlyWeather(area, fromDate, toDate),
  ])

  const len = weatherStats.time.length
  const combinedRecords = new Array(len)

  for (let i = 0; i < len; i++) {
    combinedRecords[i] = {
      time: weatherStats.time[i],
      apparent_temperature: weatherStats.apparent_temperature[i],
      rain: weatherStats.rain[i],
      us_aqi: airQualityStats.us_aqi[i],
    }
  }

  const header = "time,apparent_temperature,rain,us_aqi\n"
  const rows = combinedRecords.map((record) => {
    return `${record.time},${record.apparent_temperature},${record.rain},${record.us_aqi}\n`
  })
  const csv = header + rows.join("")
  writeFileSync(`../hourly-aqi-weather/${area}/${fromDate}-${toDate}.csv`, csv)
}

combineWeatherWithAQI(area, fromDate, toDate)
