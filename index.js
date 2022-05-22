const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@forgethedrill.6ry4r.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const toolCollection = client.db("forge-the-drill").collection("drills");
    const reviewCollection = client.db("forge-the-drill").collection("reviews");

    app.get("/drill", async (req, res) => {
      const drills = await toolCollection.find({}).toArray();
      res.send(drills);
    });

    app.get("/drill/:id", async (req, res) => {
      const id = req.params;
      const review = await toolCollection.findOne({ _id: ObjectId(id) });
      res.send(review);
    });

    app.get("/review", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Forge The Drill");
});

app.listen(port, () => {
  console.log(`Drilling from port ${port}`);
});
