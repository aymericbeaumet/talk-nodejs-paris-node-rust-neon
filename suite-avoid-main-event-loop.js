const Benchmark = require("benchmark");
const child_process = require("child_process");
const { Worker } = require("worker_threads");
const javascript = require("./src/lib");

const ITERATIONS = 1000000;

const avoidMainEventLoopSuite = new Benchmark.Suite();

avoidMainEventLoopSuite.add({
  name: "Main event loop",
  fn() {
    javascript.pi(ITERATIONS);
  }
});

const child = child_process.fork(require.resolve("./child-process"), {
  env: { ITERATIONS }
});
avoidMainEventLoopSuite.add({
  name: "Child process",
  defer: true,
  fn(deferred) {
    child.once("message", () => deferred.resolve());
    child.send(null, error => {
      if (error) {
        throw error;
      }
    });
  },
  onAbort: () => child.kill(),
  onError: () => child.kill(),
  onComplete: () => child.kill()
});

const thread = new Worker(require.resolve("./worker-thread"), {
  workerData: { iterations: ITERATIONS }
});
avoidMainEventLoopSuite.add({
  name: "Worker thread",
  defer: true,
  fn(deferred) {
    thread.once("message", () => deferred.resolve());
    thread.postMessage(null, error => {
      if (error) {
        throw error;
      }
    });
  },
  onAbort: () => thread.terminate(),
  onError: () => thread.terminate(),
  onComplete: () => thread.terminate()
});

avoidMainEventLoopSuite
  .on("start", function() {
    console.log(`
---
What is the performance impact to avoid running synchronous code in the main event loop?
---`);
  })
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
