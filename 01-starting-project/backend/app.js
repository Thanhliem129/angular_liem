import fs from "node:fs/promises";

import bodyParser from "body-parser";
import express from "express";
import sql from 'mssql'
import cors from 'cors'


const app = express();

// var sql = require('mssql/msnodesqlv8')
// var config = {
//   server: 'localhost',
//   user: "liemdt",
//   password: "123456a@",
//   database: "Test",
//   driver: 'msnodesqlv8'
// }


app.use(express.static("images"));
app.use(bodyParser.json());

// CORS
app.use(cors())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  next();
});

// connection 
const config = {
  user: 'liemdt',
  password: '123456a@',
  server: '192.168.60.28',
  database: 'ERP_HOPLONG_DEV',
  options: {
    encrypt: false, // Enable encryption
    trustServerCertificate: true // For development only
  }
};

sql.connect(config, err => {
  if (err) {
      console.log(err);
  } else {
      console.log('Connected to SQL Server');
  }
})
  // test
app.get("/test", async (req, res) => {

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
        .query(`SELECT top 10 * FROM HH`);
    res.json(result.recordset);
} catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get("/places", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const fileContent = await fs.readFile("./data/places.json");

  const placesData = JSON.parse(fileContent);

  res.status(200).json({ places: placesData });
});



app.get("/user-places", async (req, res) => {
  const fileContent = await fs.readFile("./data/user-places.json");

  const places = JSON.parse(fileContent);

  res.status(200).json({ places });
});

app.put("/user-places", async (req, res) => {
  const placeId = req.body.placeId;

  const fileContent = await fs.readFile("./data/places.json");
  const placesData = JSON.parse(fileContent);

  const place = placesData.find((place) => place.id === placeId);

  const userPlacesFileContent = await fs.readFile("./data/user-places.json");
  const userPlacesData = JSON.parse(userPlacesFileContent);

  let updatedUserPlaces = userPlacesData;

  if (!userPlacesData.some((p) => p.id === place.id)) {
    updatedUserPlaces = [...userPlacesData, place];
  }

  await fs.writeFile(
    "./data/user-places.json",
    JSON.stringify(updatedUserPlaces)
  );

  res.status(200).json({ userPlaces: updatedUserPlaces });
});

app.delete("/user-places/:id", async (req, res) => {
  const placeId = req.params.id;

  const userPlacesFileContent = await fs.readFile("./data/user-places.json");
  const userPlacesData = JSON.parse(userPlacesFileContent);

  const placeIndex = userPlacesData.findIndex((place) => place.id === placeId);

  let updatedUserPlaces = userPlacesData;

  if (placeIndex >= 0) {
    updatedUserPlaces.splice(placeIndex, 1);
  }

  await fs.writeFile(
    "./data/user-places.json",
    JSON.stringify(updatedUserPlaces)
  );

  res.status(200).json({ userPlaces: updatedUserPlaces });
});

// 404
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.status(404).json({ message: "404 - Not Found" });
});

app.listen(3000);
