const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("./src/config/Db.config.js");

const UserRoutes = require("./src/routes/UserRoutes");
const AdminRoutes = require("./src/routes/AdminRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", UserRoutes);
app.use("/admin", AdminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
