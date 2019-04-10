const { parentPort } = require("worker_threads");
const { synchronous } = require("./src/lib");

parentPort.on("message", () => {
  synchronous();
  parentPort.postMessage("done");
});
