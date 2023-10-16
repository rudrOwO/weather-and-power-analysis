import { retreiveDailyPowerStats } from "./power.js"
import { retreiveDailyRainfall } from "./rain.js"
import { namesToAreaCodes } from "./power.js"
const [_, __, area, fromDate, toDate] = process.argv

if (area === undefined || fromDate === undefined || toDate === undefined) {
  console.error("Usage: node index.js <area> <fromDate> <toDate>")
  console.log("Example: node index.js dhaka 01/01/2013 03/01/2013")
  process.exit(1)
}

if (namesToAreaCodes[area] === undefined) {
  console.error("Invalid area name")
  process.exit(1)
}

// const elements = await retreiveDailyPowerStats(area, fromDate, toDate)
const daily = await retreiveDailyRainfall(area, fromDate, toDate)

const combineRainfallWithPower = async (area, fromDate, toDate) => {
  const [powerStats, rainfallStats] = await Promise.all([
    retreiveDailyPowerStats(area, fromDate, toDate),
    retreiveDailyRainfall(area, fromDate, toDate),
  ])
}

console.log(JSON.stringify(daily, null, 2))
