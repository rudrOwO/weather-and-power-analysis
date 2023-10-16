import { parse } from "node-html-parser"

export const areaCodesToNames = {
  1: "dhaka",
  2: "chittagong",
  3: "khulna",
  4: "rajshahi",
  5: "comilla",
  6: "mymensingh",
  7: "sylhet",
  8: "barisal",
  9: "rangpur",
}

export const namesToAreaCodes = {
  dhaka: 1,
  chittagong: 2,
  khulna: 3,
  rajshahi: 4,
  comilla: 5,
  mymensingh: 6,
  sylhet: 7,
  barisal: 8,
  rangpur: 9,
}

export const retreivePowerData = async (areaCode) => {
  const payload = new FormData()
  payload.append("area", areaCode)
  payload.append("from_date", "01/01/2013")
  payload.append("to_date", "03/01/2013")

  const response = await fetch(
    "http://119.40.95.168/bpdb/index.php/area_wise_demand_search",
    {
      method: "POST",
      body: payload,
    }
  )

  const html = "<div>" + (await response.text()) + "</div>"
  const node = parse(html)
  return node.getElementsByTagName("td")
}
