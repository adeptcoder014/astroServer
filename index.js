const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./database");

//====================================================

// Use the session middleware

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//====================================================
app.get("/", (req, res) => {
  res.send("<h1> AstroLogics Server </h1>");
});
//===================================================
app.use("/transit", require("./routes/transit"));
app.use("/user", require("./routes/user"));
// app.use("/auth", require("./routes/auth"));


//===================================================
app.listen(process.env.PORT, () => {
  console.log(`Server started on PORT : ${process.env.PORT} `);
});
