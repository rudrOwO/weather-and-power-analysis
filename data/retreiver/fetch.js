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

  const len = weatherStats.time.length
  const combinedRecords = new Array(len)

  for (let i = 0, j = 0, demand, loadShed; i < len; i++) {
    // Handling missing records in Power dataset
    if (powerStats[j].date === weatherStats.time[i]) {
      demand = powerStats[j].demand
      loadShed = powerStats[j].loadShed
      j++
    } else {
      console.log("Missing power stats for: ", weatherStats.time[i])
      demand = ""
      loadShed = ""
    }

    combinedRecords[i] = {
      date: weatherStats.time[i],
      demand,
      loadShed,
      rainfall: weatherStats.rain_sum[i],
      mean_temperature: weatherStats.temperature_2m_mean[i],
      relativehumidity_2m: weatherStats.relativehumidity_2m[i],
      windspeed_100m: weatherStats.windspeed_100m[i],
      daytime_length: weatherStats.daytime_length[i],
    }
  }

  const header =
    "date,power_demand,load_shed,rainfall,mean_temperature,relativehumidity_2m,windspeed_100m,daytime_length\n"
  const rows = combinedRecords.map((record) => {
    return `${record.date},${record.demand},${record.loadShed},${record.rainfall},${record.mean_temperature},${record.relativehumidity_2m},${record.windspeed_100m},${record.daytime_length}\n`
  })
  const csv = header + rows.join("")
  writeFileSync(`../csv/${area}/${fromDate}-${toDate}.csv`, csv)
}

generateCombinedCSV(area, fromDate, toDate)
