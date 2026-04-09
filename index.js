const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://marketdbUser:31yD5GtZJfxB7mjk@contesthubcluster.tjeey7t.mongodb.net/?appName=ContestHubCluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/',(req,res) => {
    res.send('Market Server is running');
})

async function run() {
    try{
        await client.connect();

        const db = client.db('market_db');
        const jobsCollection = db.collection('jobs');

        app.post('/jobs' , async(req,res) =>{
            const newJob = req.body;
            const result = await jobsCollection.insertOne(newJob);
            res.send(result);
        })

        app.delete('/jobs/:id',(req,res) =>{
            const id = req.params.id;
        })




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally{

    }

}
run().catch(console.dir)

app.listen(port, ()=> {
    console.log(`Market server is running on port:${port}`)
})