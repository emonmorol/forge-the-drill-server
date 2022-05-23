const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ObjectID,
} = require("mongodb");
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
    const orderCollection = client.db("forge-the-drill").collection("orders");
    const userCollection = client.db("forge-the-drill").collection("users");

    app.put("/user", async (req, res) => {
      const { email, name } = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: name,
          email: email,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send({ success: true, result });
    });
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

    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send({ success: true, result });
    });

    app.get("/order", async (req, res) => {
      const { email } = req.query;
      const orders = await orderCollection.find({ userEmail: email }).toArray();
      res.send(orders);
    });

    app.delete("/order", async (req, res) => {
      const { id } = req.query;
      const query = { _id: ObjectID(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
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
