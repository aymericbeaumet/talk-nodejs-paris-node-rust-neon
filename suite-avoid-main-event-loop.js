#!/usr/bin/env node
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
    console.log(`First, we want to know what is the performance impact to run synchronous
code inside/outside the main event loop. What we want to highlight with this
benchmark is that solutions exist when synchronous code need to be run, but
they come at a price.
`);
  })
  .on("cycle", function(event) {
    console.log(`    ${String(event.target)}`);
  })
  .on("complete", function() {
    console.log(`    -> Fastest is ${this.filter("fastest").map("name")}

The main event loop is indeed the fastest, as expected. The child processes
and worker threads have to take orders and communicate their results from/to
the main thread, meaning they are limited by the speed at which they can
receive/send messages. That being said, the performance impact is acceptable
considering it enables to stop polluting the event loop with non-trivial
synchronous operations.
`);
  })
  .run({ async: true });
