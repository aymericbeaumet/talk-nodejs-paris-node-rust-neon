const Benchmark = require("benchmark");
const child_process = require("child_process");
const { Worker } = require("worker_threads");
const {
  synchronous: javascriptSynchronous,
  asynchronous: javascriptAsynchronous
} = require("./src/lib");
const {
  synchronous: rustSynchronous,
  asynchronous: rustAsynchronous
} = require("./native/index.node");

const suite = new Benchmark.Suite();

/*
 * Populate benchmark suite.
 */

suite.add({
  name: "[JavaScript] Main thread / synchronous",
  fn() {
    javascriptSynchronous();
  }
});

suite.add({
  name: "[JavaScript] Main thread / asynchronous",
  defer: true,
  fn(deferred) {
    javascriptAsynchronous(1, 1, error => {
      if (error) {
        throw error;
      }
      deferred.resolve();
    });
  }
});

const thread = new Worker(
  require.resolve("./worker-thread-synchronous-javascript")
);
suite.add({
  name: "[JavaScript] Worker thread / synchronous",
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

const child = child_process.fork(
  require.resolve("./child-process-synchronous-javascript")
);
suite.add({
  name: "[JavaScript] Child process / synchronous",
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

suite.add({
  name: "[Rust] Main thread / synchronous",
  fn() {
    rustSynchronous(100);
  }
});

/*
 * Start benchmarking!
 */

suite
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
