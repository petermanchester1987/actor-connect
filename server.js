const express = require("express");
const connectDB = require("./config/db");

//initialize express
const app = express();

//connect database
connectDB();

//init middleware USED TO BE bodyParser.json but not anymore
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("API running");
});

//define routes

//users
app.use("/api/users", require("./routes/api/users"));
//auth
app.use("/api/auth", require("./routes/api/auth"));
//profile
app.use("/api/profile", require("./routes/api/profile"));
//posts
app.use("/api/posts", require("./routes/api/posts"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
