import { writeFileSync } from "fs"
import { retreiveDailyPowerStats, retreiveDailyWeather } from "./web.js"
import { guardAgainstInvalidInputs } from "./utils.js"

const [_, __, area, fromDate, toDate] = process.argv
guardAgainstInvalidInputs(area, fromDate, toDate)

const generateCombinedCSV = async (area, fromDate, toDate) => {
  const [powerStats, weatherStats] = await Promise.all([
    retreiveDailyPowerStats(area, fromDate, toDate),
    retreiveDailyWeather(area, fromDate, toDate),
  ])

  const len = powerStats.length
  const combinedRecords = new Array(len)

  for (let i = 0, j = 0; j < len; i++) {
    // Handling missing records in Power dataset
    if (powerStats[j].date === weatherStats.time[i]) {
      combinedRecords[j] = {
        date: weatherStats.time[i],
        demand: powerStats[j].demand,
        loadShed: powerStats[j].loadShed,
        rainfall: weatherStats.rain_sum[i],
        mean_temperature: weatherStats.temperature_2m_mean[i],
        mean_apparent_temperature: weatherStats.mean_apparent_temperature[i],
        relativehumidity_2m: weatherStats.relativehumidity_2m[i],
        windspeed_10m: weatherStats.windspeed_10m[i],
        windspeed_100m: weatherStats.windspeed_100m[i],
        daytime_length: weatherStats.daytime_length[i],
        dewpoint_2m: weatherStats.dewpoint_2m[i],
        cloudcover: weatherStats.cloudcover[i],
        soil_temperature_0_to_7cm: weatherStats.soil_temperature_0_to_7cm[i],
      }
      j++
    } else {
      console.log("Missing power stats for: ", weatherStats.time[i])
    }
  }

  const header =
    "date,power_demand,load_shed,rainfall,mean_temperature,mean_apparent_temperature,relativehumidity_2m,windspeed_10m,windspeed_100m,daytime_length,dewpoint_2m,cloudcover,soil_temperature_0_to_7cm\n"
  const rows = combinedRecords.map((record) => {
    return `${record.date},${record.demand},${record.loadShed},${record.rainfall},${record.mean_temperature},${record.mean_apparent_temperature},${record.relativehumidity_2m},${record.windspeed_10m},${record.windspeed_100m},${record.daytime_length},${record.dewpoint_2m},${record.cloudcover},${record.soil_temperature_0_to_7cm}\n`
  })
  const csv = header + rows.join("")

  try {
    writeFileSync(`../csv/${area}/${fromDate}-${toDate}.csv`, csv)
    console.log(`csv written to ../csv/${area}/${fromDate}-${toDate}.csv`)
  } catch (e) {
    console.error("Error writing to csv file: ", e)
    process.exit(1)
  }
}

generateCombinedCSV(area, fromDate, toDate)
