import { namesToAreaCodes } from "./weather-power.js"

export const reformatDate = (date) => {
  const [day, month, year] = date.split("/")
  return `${year}-${month}-${day}`
}

export const guardAgainstInvalidInputs = (area, fromDate, toDate) => {
  if (
    area === undefined ||
    fromDate === undefined ||
    toDate === undefined
  ) {
    console.error("Usage: node index.js <area> <fromDate> <toDate>")
    console.log("Example: node index.js dhaka 01/01/2013 03/01/2013")
    process.exit(1)
  }

  if (namesToAreaCodes[area] === undefined) {
    console.error("Invalid area name")
    process.exit(1)
  }
}
