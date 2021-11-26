const moment = require("moment");
function formatMassage(username, text) {
  return {
    username: username,
    text: text,
    time: moment().format("h:mm a"),
  };
}

module.exports = formatMassage;
