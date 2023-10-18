## Correlating Weather Variables with Power Demands in Bangladeshi Divisions

### Automatic Data Retreiver

In the <code>data</code> folder,

- Navigate to the `retreiver` folder and run `npm i` or equivalent to install dependencies
- Run `npm csv <division name> <starting date> <ending date>` or equivalent to generate and write csv files in the `csv` folder
- Date format: yyyy-mm-dd
- Allowed range: 2016-01-01 to 2023-09-30
- Division names: barisal, chittagong, comilla, dhaka, khulna, mymensingh, rajshahi, rangpur, sylhet

### Regression Insights

View regression notebooks and insights in the <code>regression</code> folder (work in progress)

---

Data Sources:

- [Bangladesh Power Development Board](http://119.40.95.168/bpdb/area_wise_demand)
- [Open Meteo Weather API](https://open-meteo.com/)
