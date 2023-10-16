export const reformatDate = (date) => {
  const [month, day, year] = date.split("/")
  return `${year}-${month}-${day}`
}
