const controller = require("../controllers/logs.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/log/createLog", controller.createLog);

  app.post("/api/log/getLogs", controller.getLogs);
};
