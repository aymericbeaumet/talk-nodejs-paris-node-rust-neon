const javascript = require("./src/lib");

const iterations = parseInt(process.env.ITERATIONS);

process.on("message", () => {
  javascript.pi(iterations);
  process.send("done");
});
