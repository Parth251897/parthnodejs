const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/collage", {})
  .then(() => {
    console.log("database connt");
  })
  .catch((error) => {
    console.log("not connt");
  });

module.exports = {
  url: "mongodb://localhost:27017/collage",
};
