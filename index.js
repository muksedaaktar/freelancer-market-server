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

app.get('/', (req, res) => {
    res.send('Market Server is running');
})

async function run() {
    try {
        await client.connect();

        const db = client.db('market_db');
        const jobsCollection = db.collection('jobs');
        const userscCollection = db.collection('users');
        const acceptedTasksCollection = db.collection('acceptedTasks');

        //Accepted Task APIs
        app.post('/acceptedTasks', async (req, res) => {

            const acceptedTask = req.body;

            const { _id, ...rest } = acceptedTask;

            // ❌ prevent own job acceptance
            if (acceptedTask.postedBy === acceptedTask.acceptedBy) {
                return res.status(403).send({
                    message: "You cannot accept your own job"
                });
            }

            const result = await acceptedTasksCollection.insertOne(rest);

            res.send(result);
        });

        app.get('/acceptedTasks', async (req, res) => {

            const email = req.query.email;
            const query = {
                acceptedBy: email
            };
            const result = await acceptedTasksCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/acceptedTasks/:id', async (req, res) => {

            try {

                const id = req.params.id;

                const query = {
                    _id: new ObjectId(id)
                };

                const result = await acceptedTasksCollection.deleteOne(query);

                res.send(result);

            }
            catch (error) {

                console.log(error);

                res.status(500).send({
                    error: "Delete failed"
                });

            }

        });
        //users APIs
        app.post('/users', async (req, res) => {
            const newUser = req.body;

            const email = req.body.email;
            const query = { email: email };
            const existingUser = await userscCollection.findOne(query);
            if (existingUser) {
                res.send({ message: 'User alredy exist.' })
            }
            else {
                const result = await userscCollection.insertOne(newUser);
                res.send(result);
            }



        })


        //get latest job
        app.get('/latest-jobs', async (req, res) => {
            const cursor = jobsCollection.find().sort({ createdAt: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })


        //get all jobs
        app.get('/jobs', async (req, res) => {

            const email = req.query.email;
            const category = req.query.category;

            const query = {};

            if (email) {
                query.userEmail = email;
            }

            if (category) {
                query.category = category;
            }

            const cursor = jobsCollection.find(query).sort({ createdAt: -1 });
            const result = await cursor.toArray();

            res.send(result);
        });

        //get one job
        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        })


        //post job
        app.post('/jobs', async (req, res) => {

            const newJob = {
                ...req.body,
                createdAt: new Date()
            };

            const result = await jobsCollection.insertOne(newJob);

            res.send(result);
        })

        //update job
        app.patch('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedJob = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: updatedJob
                // {
                //     title:updatedJob.title,
                //     category:updatedJob.category,
                //     summary:updatedJob.summary,
                //     coverImage:updatedJob.coverImage

                // }
            };
            const result = await jobsCollection.updateOne(query, update);
            res.send(result);
        })

        //delete job
        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.deleteOne(query);
            res.send(result);
        })




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally {

    }

}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`Market server is running on port:${port}`)
})