// Requerimiento packages
const express = require("express");
const axios = require('axios');

require('dotenv').config()

// Create express server
const app = express();

// Set template engine
app.set("view engine", "ejs");
app.use(express.static('public'));

// Needed to parse html data for POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Function to extract video ID from YouTube URL
function extractVideoId(youtubeUrl) {
  const videoIdPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  const match = youtubeUrl.match(videoIdPattern);
  if (match) {
    return match[1]; // The video ID is second capture group
  } else {
    throw new Error('No se pudo extraer el ID del video de la URL proporcionada.');
  }
}

// GET route
app.get("/", (req, res) => {
  res.render("index");
});

// POST route
app.post("/convert-mp3", async (req, res) => {
  const youtubeUrl = req.body.youtubeUrl; // Cambio aquí para tomar la URL completa
  console.log(youtubeUrl);
  if (!youtubeUrl) {
    return res.render("index", { success: false, message: "Please enter a YouTube URL" });
  }

  let videoId;
  try {
    videoId = extractVideoId(youtubeUrl);
  } catch (error) {
    return res.render("index", { success: false, message: error.message });
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
