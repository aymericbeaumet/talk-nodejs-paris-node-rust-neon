const { parentPort, workerData } = require("worker_threads");
const javascript = require("./src/lib");

const { iterations } = workerData;

parentPort.on("message", () => {
  javascript.pi(iterations);
  parentPort.postMessage("done");
});
