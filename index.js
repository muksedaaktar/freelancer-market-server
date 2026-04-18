const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        app.get('/jobs',async(req,res) =>{
            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/jobs/:id',async(req,res) =>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await jobsCollection.findOne(query);
            res.send(result);
        })

        app.post('/jobs' , async(req,res) =>{
            const newJob = req.body;
            const result = await jobsCollection.insertOne(newJob);
            res.send(result);
        })

        app.patch('/jobs/:id',async(req,res) =>{
            const id = req.params.id;
            const updatedJob = req.body;
            const query = { _id: new ObjectId(id)}
            const update = {
                $set: {
                    name:updatedJob.name,
                    category:updatedJob.category

                }
            }
            const result = await jobsCollection.updateOne(query,update);
            res.send(result);
        })

        app.delete('/jobs/:id',async(req,res) =>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await jobsCollection.deleteOne(query);
            res.send(result);
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