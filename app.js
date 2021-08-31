const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());

const dbPath = path.join(__dirname, "userData.db");
let db = null;

const initializeAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(process.env.PORT || 3000, console.log("Server Running at http://localhost:3000/"))
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeAndServer();

//1.LOGIN API
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectedUser = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectedUser);
  if (dbUser === undefined) {
    response.status(400);
    response.send({ error: "Invalid username or password" });
  } else {
    if (dbUser.password === password) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send({ error: "Invalid username or password" });
    }
  }
});

//2.POST API
app.post("/", async (request, response) => {
  const { bas, lta, hra, fa, inv, rent, city_type, med } = request.body;
  const query = `INSERT INTO
        salary (bas, lta, hra, fa, inv, rent, city_type, med)
    VALUES
        (${bas},${lta},${hra},${fa},${inv},${rent},'${city_type}',${med});`;
  const userData = await db.run(query);
  response.send("Successfully added");
});

module.exports = app;