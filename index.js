const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nb38n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("trackingPlaces");
    const packageCollection = database.collection("packages");
    const orderCollection = database.collection("orders");

    //get all packages api
    app.get("/allpackages", async (req, res) => {
      const cursor = packageCollection.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });

    // get my orders
    app.get("/myorders/:email", async (req, res) => {
      const result = await orderCollection.find({
        email: req.params.email,
      }).toArray();
      res.send(result);
    });


    //get Ordered item
    app.get('/order/:packid', async (req, res) => {
      const packageId = req.params.packid;
      const query = { _id: ObjectId(packageId) };
      const package = await packageCollection.findOne(query);
      console.log("load user with id", packageId);
      res.send(package);
    })


    // add a package
    app.post("/addpackage", async (req, res) => {
      const newPack = req.body;
      const result = await packageCollection.insertOne(newPack);
      console.log("got new pack", req.body);
      console.log("successfully added pack", result);
      res.json(result);
    });

    //confirm order
    app.post("/placeorder", async (req, res) => {
      const orderpack = req.body;
      const result = await orderCollection.insertOne(orderpack);
      console.log("order placed", req.body);
      console.log("successfully ordered", result);
      res.json(result);
    });

    //get all order
    app.get('/allorder', async (req, res) => {
      const cursor = orderCollection.find({});
      const services = await cursor.toArray();
      res.json(services);
    });
    // delete a single package
    app.delete("/allorder/:id", async (req, res) => {
      const id = req.params.id;
      console.log('deleted id ', id)
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    //update order status
    app.put('/allorder/:id', async (req, res) => {
      const id = req.params.id;
      console.log(req.body);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const packUpdate = {
        $set: {
          status: 'approved'
        }
      };
      const result = await orderCollection.updateOne(filter, packUpdate, options);
      res.json(result)
    })


    console.log('connected to Trackers Zone database');
  }
  finally {
    //   await client.close()
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Running Trackers Zone Server..')
})

app.listen(port, () => {
  console.log('Listening to Trackers Zone server on', port);
})