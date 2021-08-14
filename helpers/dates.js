function getDateString(dateOb) {
  if (dateOb instanceof Date) {
    return `<t:${dateOb.getTime() / 1000}:d>`;
  }
  return dateOb;
}

function getDateTimeString(dateOb) {
  if (dateOb instanceof Date) {
    return `<t:${dateOb.getTime() / 1000}:f>`;
  }
  return dateOb;
}

function getRawDateString(dateOb) {
  if (dateOb instanceof Date) {
    const date = (`0${dateOb.getDate()}`).slice(-2);
    const month = (`0${dateOb.getMonth() + 1}`).slice(-2);
    const year = dateOb.getFullYear();
    const finalDate = `${month}/${date}/${year}`;
    return finalDate;
  }
  return dateOb;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = {
  getDateString, getDateTimeString, addDays, getRawDateString,
};
