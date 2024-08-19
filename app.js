// Requerimiento packages
const express = require("express");
// npm install node-fetch@2
const fetch = require("node-fetch");
const request = require('request');
const axios = require('axios');

require('dotenv').config()

// Create express server
const app = express();

// Set template engine
app.set("view engine", "ejs");
app.use(express.static('public'));

// Needed to parse html data for POST requests
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

// GET route
app.get("/", (req, res) => {
  res.render("index");
});

// POST route
app.post("/convert-mp3", async (req, res) => {
  const videoId = req.body.videoId;

  if (!videoId) {
    return res.render("index", { success: false, message: "Please enter a video ID" });
  }

  try {
    const response = await axios.get(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": process.env.API_HOST
      }
    });

    if (response.data.status === "ok") {
      return res.render("index", { success: true, song_title: response.data.title, song_link: response.data.link });
    } else {
      return res.render("index", { success: false, message: response.data.msg });
    }
  } catch (error) {
    console.error(error);
    return res.render("index", { success: false, message: "An error occurred while processing the request" });
  }
});

// Indicate the port number server will run on
const PORT = process.env.PORT || 10000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});