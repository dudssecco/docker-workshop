const express = require("express");
const cors = require("cors");
const { initDB } = require("./db");
const routes = require("./routes");

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(routes);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Backend rodando na porta ${port}`);
  });
});
