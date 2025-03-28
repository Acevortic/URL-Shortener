import express from "express";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { config } from "dotenv";

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());

config();

const uri = process.env.MONGO_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const urlSchema = new mongoose.Schema( {
    originalUrl: String,
    shortid: String,
    clicks: [{ timestamp: Date, ip: String, userAgent: String}]
});

const url = mongoose.model("URL", urlSchema);

app.post("/shorten", async (req, res) => {
    const originalUrl = req.body.originalUrl;
    const shortid = nanoid(6);
    const newURL = await url.create({originalUrl, shortid, clicks: []});
    res.json({shortUrl: `http://localhost:${PORT}/${shortid}`});
});

app.get("/:shortid", async (req, res) => {
    const shortUrl = req.params.shortUrl;
    const urlEntry = await url.findOne({shortUrl});
    if (!urlEntry) return res.status(404).json({error: "Not found"});

    urlEntry.clicks.push({
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    await urlEntry.save();
    res.redirect(urlEntry.originalUrl);
});

app.get("/analytics:shortid", async (req, res) => {
    const urlEntry = await url.findOne({shortid: req.params.shortid });

    if (!urlEntry) return res.status(404).json({error: "Not found"});

    res.json( {
        totalClicks: urlEntry.clicks.length,
        clicks: urlEntry.clicks,
    });
});

app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);

async function run() {
    try {
      // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
      await mongoose.connect(uri, clientOptions);
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit if MongoDB connection fails
    }
  }
  run().catch(console.dir);
