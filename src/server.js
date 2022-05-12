const express = require("express");
const path = require("path");

const fs = require("fs");
const app = express();
var scores = require("./scores.json");

const port = process.env.PORT || 8000;

var cors = require("cors");
app.use(cors());

app.use("/", express.static("public"));

app.set("trust proxy", true);

app.get("/levels", (req, res) => {
  res.send(fs.readdirSync(path.join(__dirname, "../public/assets/levels")));
});

app.get("/addScore", (req, res) => {
  var time = req.query.time;
  var collected = req.query.collected;

  if (!scores[req.ip]) {
    scores[req.ip] = {};
  }

  if (scores[req.ip][req.query.level]) {
    if (parseInt(time.replaceAll(":", "")) > parseInt(scores[req.ip][req.query.level].time.replaceAll(":", ""))) {
      time = scores[req.ip][req.query.level].time;
    }
    if (parseInt(collected) < parseInt(scores[req.ip][req.query.level].collected)) {
      collected = scores[req.ip][req.query.level].collected;
    }
  }

  scores[req.ip][req.query.level] = { time, collected };
});

app.get("/getScore", (req, res) => {
  res.json(scores[req.ip] || "{}");
});

app.listen(port);

console.log("express running at http://localhost:%d", port);

setInterval(() => {
  fs.writeFile("./src/scores.json", JSON.stringify(scores), (err) => {
    if (err) {
      console.error(err);
    }
    console.log("Saving scores...");
  });
}, 60000);