const functions = require("@google-cloud/functions-framework");
const escapeHtml = require("escape-html");
const axios = require("axios");

require("dotenv").config();

/**
 * Responds to an HTTP request using data from the request body parsed according
 * to the "content-type" header.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

var nextHol = {};

functions.http("calenderific", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");

  var datetime = new Date();
  //convert to GMT+8 or UTC+8 by adding 8 hours
  datetime += 8 * 60 * 60 * 1000;
  var date = new Date(datetime);
  var curr_year = date.getUTCFullYear();
  var curr_month = date.getUTCMonth();
  var curr_day = date.getUTCDate();

  var holArr = [];

  if (
    Object.keys(nextHol).length === 0 ||
    compareDateHasPassed(
      curr_day,
      curr_month,
      curr_year,
      nextHol.date.datetime.day,
      nextHol.date.datetime.month,
      nextHol.date.datetime.year
    )
  ) {
    // only change upcoming holiday if the current date has passed the previous upcoming holiday date
    holArr = await getListOfSgHolidaysInYear(curr_year);

    nextHol = getUpcomingHoliday(holArr, curr_day, curr_month);

    console.log(holArr);

    console.log(nextHol);
  }

  // res.send(
  //   `Hello ${escapeHtml(
  //     req.query.name || req.body.name || "World"
  //   )}! The datetime is now ${escapeHtml(
  //     date
  //   )} The next holiday is ${escapeHtml(nextHol.name)}`
  // );

  res.json(nextHol);
});

function getUpcomingHoliday(holArr, curr_day, curr_month) {
  var nextHol = {};

  for (let i = 0; i < holArr.length; i++) {
    var curr = holArr[i];
    if (
      curr.type.includes("National holiday") &&
      curr.date.datetime.month <= curr_month &&
      curr.date.datetime.day < curr_day
    ) {
      nextHol = curr;
      break;
    }
  }

  return nextHol;
}

async function getListOfSgHolidaysInYear(year) {
  // get from calenderific api
  const res = await axios.get(
    "https://calendarific.com/api/v2/holidays?country=SG&year=" +
      year +
      "&api_key=" +
      process.env.CALENDERIFIC_KEY
  );
  return res.data.response.holidays;
}

function compareDateHasPassed(
  curr_day,
  curr_month,
  curr_year,
  day,
  month,
  year
) {
  if (curr_year > year || curr_month > month || curr_day > day) {
    return true;
  } else {
    return false;
  }
}
