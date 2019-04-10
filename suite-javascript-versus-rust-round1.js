const Benchmark = require("benchmark");
const javascript = require("./src/lib");
const rust = require("./native/index.node");

const N = 100;

const javascriptVersusRust = new Benchmark.Suite();

javascriptVersusRust.add({
  name: "JavaScript synchronous",
  fn() {
    javascript.factorial(N);
  }
});

javascriptVersusRust.add({
  name: "Rust synchronous",
  fn() {
    rust.factorial(N);
  }
});

javascriptVersusRust
  .on("start", function() {
    console.log(`
---
So, is worth it leveraging Rust?
---`);
  })
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
