const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const { createProxyMiddleware } = require('http-proxy-middleware');

const dbConfig = require("./app/config/db.config");

const app = express();

var corsOptions = {
  origin: ["http://localhost:4200"],
  credentials: true
}

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "bezkoder-session",
    secret: "COOKIE_SECRET", // should use as secret environment variable
    httpOnly: true
  })
);

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// Create a proxy middleware for the Aviation Weather API
const aviationWeatherProxy = createProxyMiddleware({
  target: 'https://beta.aviationweather.gov', // Aviation Weather API base URL
  changeOrigin: true,
  pathRewrite: {
    '^/api/aviation-weather': '' // Remove the '/api/aviation-weather' path prefix
  }
});


// Proxy requests to the Aviation Weather API
app.use('/api/aviation-weather', aviationWeatherProxy);

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/log.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
