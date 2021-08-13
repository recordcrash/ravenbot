function getDateString(dateOb) {
  if (dateOb instanceof Date) {
    return `<t:${dateOb.getTime() / 1000}:d>`;
  }
  return dateOb;
}

function getDateTimeString(dateOb) {
  if (dateOb instanceof Date) {
    return `${dateOb.getTime() / 1000}`;
  }
  return dateOb;
}

module.exports = { getDateString, getDateTimeString };
