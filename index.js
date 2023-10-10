if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = require("./app");
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
