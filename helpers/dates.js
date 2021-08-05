function getDateString(dateOb) {
  if (dateOb instanceof Date) {
    const date = (`0${dateOb.getDate()}`).slice(-2);
    const month = (`0${dateOb.getMonth() + 1}`).slice(-2);
    const year = dateOb.getFullYear();
    const finalDate = `${month}/${date}/${year}`;
    return finalDate;
  }
  return dateOb;
}

function getDateTimeString(dateOb) {
  if (dateOb instanceof Date) {
    const date = (`0${dateOb.getDate()}`).slice(-2);
    const month = (`0${dateOb.getMonth() + 1}`).slice(-2);
    const year = dateOb.getFullYear();
    const hours = (`0${dateOb.getHours()}`).slice(-2);
    const minutes = (`0${dateOb.getMinutes()}`).slice(-2);
    const seconds = (`0${dateOb.getSeconds()}`).slice(-2);
    const finalDate = `${hours}:${minutes}:${seconds} ${month}/${date}/${year}`;
    return finalDate;
  }
  return dateOb;
}

module.exports = { getDateString, getDateTimeString };
