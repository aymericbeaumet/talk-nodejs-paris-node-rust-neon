#!/usr/bin/env node

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
    console.log(`We have now confirmed there is a communication cost when leveraging child
processes or worker threads. However this allows to execute compute intensive
synchronous operations in these environments without blocking the main event
loop.

So now we have the choice to either run blocking JavaScript code, or
something else. Some languages are very efficient when it comes to CPU-bound
operations, like C, C++ or Rust. I like Rust, let's see whether there is a
clear win performance-wise. Let's try with the factorial function!
`);
  })
  .on("cycle", function(event) {
    console.log(`    ${String(event.target)}`);
  })
  .on("complete", function() {
    console.log(`    -> Fastest is ${this.filter("fastest").map("name")}

Ah! What we see here is that while the factorial function is CPU bound, it is
not expensive enough to justify switching to a Rust implementation, the back
and forth between JavaScript and Rust are too expensive to make this a viable
solution.
`);
  })
  .run({ async: true });
