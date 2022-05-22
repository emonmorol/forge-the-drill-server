const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Forge The Drill");
});

app.listen(port, () => {
  console.log(`Drilling from port ${port}`);
});
