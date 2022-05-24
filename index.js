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
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@forgethedrill.6ry4r.mongodb.net/?retryWrites=true&w=majority`;

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

    app.get("/user", async (req, res) => {
      const users = await userCollection.find({}).toArray();
      res.send(users);
    });

    app.put("/user-role", async (req, res) => {
      const { id } = req.query;
      const { role } = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: role,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send({ success: true, result });
    });

    app.put("/update-user", async (req, res) => {
      const { qEmail } = req.query;
      const { gender, phone, address, linkedInLink, education, image, name } =
        req.body;
      const filter = { email: qEmail };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          gender: gender,
          phone: phone,
          address: address,
          linkedInLink: linkedInLink,
          education: education,
          image: image,
          name: name,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send({ success: true, result });
    });

    app.get("/user-role", async (req, res) => {
      const { email } = req.query;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    app.get("/drill", async (req, res) => {
      const drills = await toolCollection.find({}).toArray();
      res.send(drills);
    });

    app.post("/drill", async (req, res) => {
      const drill = req.body;
      const drills = await toolCollection.insertOne(drill);
      res.send(drills);
    });

    app.get("/drill/:id", async (req, res) => {
      const id = req.params;
      const result = await toolCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.patch("/drill/:id", async (req, res) => {
      const id = req.params;
      const { updatedQuantity } = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          availableQuantity: updatedQuantity,
        },
      };
      const result = await toolCollection.updateOne(filter, updateDoc, options);
      console.log("e", result);
      res.send({ success: true, result });
    });

    app.get("/review", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    });
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send({ success: true, result });
    });

    app.put("/order", async (req, res) => {
      const { orderId, transactionId } = req.body;
      const filter = { _id: ObjectId(orderId) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          transactionId: transactionId,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send({ success: true, result });
    });

    app.get("/order", async (req, res) => {
      const { email } = req.query;
      const orders = await orderCollection.find({ userEmail: email }).toArray();
      res.send(orders);
    });

    app.get("/order/:id", async (req, res) => {
      const { id } = req.params;
      const order = await orderCollection.findOne({ _id: ObjectId(id) });
      res.send(order);
    });

    app.delete("/order", async (req, res) => {
      const { id } = req.query;
      const query = { _id: ObjectID(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const { totalAmount } = req.body;
      const amount = totalAmount * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
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
