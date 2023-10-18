import * as cheerio from "cheerio"
import { reformatDate } from "./utils.js"
import { namesToAreaCodes, coordinates } from "./utils.js"

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
  }).catch((e) => {
    console.error("Error fetching data from Power Board Server: ", e)
    process.exit(1)
  })

  console.log("Power Board Server response received. Scraping HTML...")

  const html = await response.text()
  const $ = cheerio.load("<table>" + html.substring(221) + "</table>")
  const $td = $("td")

  const records = []

  for (let i = 0; i < $td.length; i += 7) {
    const date = reformatDate["dd/mm/yyyy to yyyy-mm-dd"]($td[i].children[0].data.substring(24, 34))
    const demand = $td[i + 2].children[0].data
    const loadShed = $td[i + 3].children[0].data

    records.push({ date, demand, loadShed })
  }

  records.sort((a, b) => (a.date > b.date ? 1 : -1))
  return records
}

/**
 * @typedef {Object} DailyWeather - Represents daily weather statistics.
 * @property {string[]} time
 * @property {number[]} rain_sum - Rainfall in mm
 * @property {number[]} temperature_2m_mean  - Mean temperature in degree celcius
 * @property {number[]} relativehumidity_2m - Relative humidity in percentage
 * @property {number[]} windspeed_10m - Wind speed in km/h
 * @property {number[]} windspeed_100m - Wind speed in km/h
 * @property {number[]} daytime_length - Daytime length in hours
 * @property {number[]} dewpoint_2m - Dew point in degree celcius
 * @property {number[]} cloudcover - Cloud cover in percentage
 * @property {number[]} soil_temperature_0_to_7cm - Soil temperature in degree celcius
 * @property {number[]} mean_apparent_temperature - Apparent temperature in degree celcius
 */
/**
 * @returns {Promise<DailyWeather>}
 */
export const retreiveDailyWeather = async (area, fromDate, toDate) => {
  const weatherURL = `https://archive-api.open-meteo.com/v1/archive?latitude=${coordinates[area].latitute}&longitude=${coordinates[area].longitude}&start_date=${fromDate}&end_date=${toDate}&hourly=relativehumidity_2m,windspeed_100m,windspeed_10m,dewpoint_2m,cloudcover,soil_temperature_0_to_7cm&daily=sunrise,sunset,apparent_temperature_mean,temperature_2m_mean,rain_sum&timezone=auto`
  const weatherResponse = await fetch(weatherURL).catch((e) => {
    console.error("Error fetching data from Open Meteo API: ", e)
    process.exit(1)
  })

  console.log("Open Meteo API response received")

  const weather = await weatherResponse.json()
  const dailyHumidity = new Array(weather.daily.time.length)
  const dailyWindspeed_100m = new Array(weather.daily.time.length)
  const dailyWindspeed_10m = new Array(weather.daily.time.length)
  const daytimeLength = new Array(weather.daily.time.length)
  const dailyDewPoint = new Array(weather.daily.time.length)
  const dailyCloudCover = new Array(weather.daily.time.length)
  const dailySoilTemp = new Array(weather.daily.time.length)

  const len = weather.hourly.time.length

  for (
    let i = 0,
      humidiy = 0,
      windSpeed_10m = 0,
      windSpeed_100m = 0,
      dewpoint = 0,
      cloudcover = 0,
      soil_temp = 0;
    i < len;
    i++
  ) {
    if (i % 24 === 0) {
      const morning = weather.daily.sunrise[i / 24]
      const evening = weather.daily.sunset[i / 24]
      daytimeLength[i / 24] = (new Date(evening) - new Date(morning)) / 3600000

      dailyHumidity[i / 24] = humidiy / 24
      dailyWindspeed_10m[i / 24] = windSpeed_10m / 24
      dailyWindspeed_100m[i / 24] = windSpeed_100m / 24
      dailyDewPoint[i / 24] = dewpoint / 24
      dailyCloudCover[i / 24] = cloudcover / 24
      dailySoilTemp[i / 24] = soil_temp / 24

      humidiy = 0
      windSpeed_10m = 0
      windSpeed_100m = 0
      dewpoint = 0
      cloudcover = 0
      soil_temp = 0
    }

    humidiy += weather.hourly.relativehumidity_2m[i]
    windSpeed_10m += weather.hourly.windspeed_10m[i]
    windSpeed_100m += weather.hourly.windspeed_100m[i]
    dewpoint += weather.hourly.dewpoint_2m[i]
    cloudcover += weather.hourly.cloudcover[i]
    soil_temp += weather.hourly.soil_temperature_0_to_7cm[i]
  }

  return {
    time: weather.daily.time,
    rain_sum: weather.daily.rain_sum,
    temperature_2m_mean: weather.daily.temperature_2m_mean,
    mean_apparent_temperature: weather.daily.apparent_temperature_mean,
    relativehumidity_2m: dailyHumidity,
    windspeed_10m: dailyWindspeed_10m,
    windspeed_100m: dailyWindspeed_100m,
    daytime_length: daytimeLength,
    dewpoint_2m: dailyDewPoint,
    cloudcover: dailyCloudCover,
    soil_temperature_0_to_7cm: dailySoilTemp,
  }
}
