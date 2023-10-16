import { argv } from "process"
import { retreivePowerData } from "./power.js"

const [_, __, area, fromDate, toDate] = argv

const elements = await retreivePowerData(area, fromDate, toDate)

for (let i = 3; i < elements.length; i++) {
  console.log(elements[i].textContent + ", ")
}
