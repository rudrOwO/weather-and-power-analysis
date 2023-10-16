import { retreivePowerData } from "./power.js"
const elements = await retreivePowerData("1")

console.log(elements.length)

for (let i = 3; i < elements.length; i++) {
  console.log(elements[i].textContent + ", ")
}

console.log(process.argv)
