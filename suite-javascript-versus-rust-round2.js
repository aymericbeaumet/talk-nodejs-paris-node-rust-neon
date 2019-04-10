const Benchmark = require("benchmark");
const javascript = require("./src/lib");
const rust = require("./native/index.node");

const ITERATIONS = 1000000;

const javascriptVersusRust = new Benchmark.Suite();

javascriptVersusRust.add({
  name: "JavaScript synchronous",
  fn() {
    javascript.pi(ITERATIONS);
  }
});

javascriptVersusRust.add({
  name: "Rust synchronous",
  fn() {
    rust.pi(ITERATIONS);
  }
});

javascriptVersusRust.add({
  name: "Rust synchronous parallel",
  fn() {
    rust.pi_parallel(ITERATIONS);
  }
});

javascriptVersusRust
  .on("start", function() {
    console.log(`
---
Can we find a case where Rust would be more efficient that JavaScript?
---`);
  })
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
