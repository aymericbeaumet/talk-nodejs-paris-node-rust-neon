const { synchronous } = require("./src/lib");

process.on("message", () => {
  synchronous();
  process.send("done");
});
