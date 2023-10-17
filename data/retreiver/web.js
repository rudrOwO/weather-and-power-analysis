import { parse } from "node-html-parser"
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
  })

  console.log("Power Board Server response received. Scraping HTML...")

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
 * @typedef {Object} DailyWeather - Represents daily weather statistics.
 * @property {string[]} time 
 * @property {number[]} rain_sum 
 * @property {number[]} temperature_2m_mean 
 * @property {number[]} us_aqi 
 * @property {number[]} relativehumidity_2m 
 * @property {number[]} windspeed_100m 
 * 
 /**
 * @returns {Promise<DailyWeather>} 
 */
export const retreiveDailyWeather = async (area, fromDate, toDate) => {
  const weatherURL = `https://archive-api.open-meteo.com/v1/archive?latitude=${coordinates[area].latitute}&longitude=${coordinates[area].longitude}&start_date=${fromDate}&end_date=${toDate}&hourly=relativehumidity_2m,windspeed_100m&daily=temperature_2m_mean,rain_sum&timezone=auto`
  const weatherResponse = await fetch(weatherURL)
  const weather = await weatherResponse.json()

  console.log("Open Meteo API response received")

  const dailyHumidity = new Array(weather.daily.time.length)
  const dailyWindspeed = new Array(weather.daily.time.length)

  const len = weather.hourly.time.length

  for (let i = 0, humidiy = 0, windSpeed = 0; i < len; i++) {
    if (i % 24 === 0) {
      dailyHumidity[i / 24] = humidiy / 24
      dailyWindspeed[i / 24] = windSpeed / 24
      humidiy = 0
      windSpeed = 0
    }
    humidiy += weather.hourly.relativehumidity_2m[i]
    windSpeed += weather.hourly.windspeed_100m[i]
  }

  return {
    time: weather.daily.time,
    rain_sum: weather.daily.rain_sum,
    temperature_2m_mean: weather.daily.temperature_2m_mean,
    relativehumidity_2m: dailyHumidity,
    windspeed_100m: dailyWindspeed,
  }
}