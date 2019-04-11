#!/usr/bin/env node

const Benchmark = require("benchmark");
const javascript = require("./src/lib");
const rust = require("./native/index.node");

const ITERATIONS = 1000000;

const javascriptVersusRust = new Benchmark.Suite();

javascriptVersusRust.add({
  name: "JavaScript pi",
  fn() {
    javascript.pi(ITERATIONS);
  }
});

javascriptVersusRust.add({
  name: "Rust pi",
  fn() {
    rust.pi(ITERATIONS);
  }
});

javascriptVersusRust.add({
  name: "Rust pi parallel",
  fn() {
    rust.pi_parallel(ITERATIONS);
  }
});

javascriptVersusRust
  .on("start", function() {
    console.log(`What we want is a more compute intensive function. Let's try the Leibniz
formula, which allows to approximate the decimals of Pi
(https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80): it is
inefficient, easy to implement, and allow an arbitrary number of iterations,
all of this while keeping the result in a single float. This makes it ideal
for our use case.
`);
  })
  .on("cycle", function(event) {
    console.log(`    ${String(event.target)}`);
  })
  .on("complete", function() {
    console.log(`    -> Fastest is ${this.filter("fastest").map("name")}

Ah! Here we go. We see the Rust implementation is indeed faster, this is
because we spend more time computing the result, and less time communicating
between the JS-world and the Rust-world.

Leveraging Rust becomes especially interesting when the implementation is
updated to make use of parallel iterators (provided by the rayon library),
which allow to easily distribute the computation on several threads.

Conclusion: please do not block the main event loop, and avoid using
setTimeout() to hack a quick fix. Look into spawning a new child process or
worker thread, maybe try to leverage a lower-level language more adapted to
CPU-bound computations. Be careful to understand your bottlenecks and choose
the appropriate solution. Always be driven by metrics.
`);
  })
  .run({ async: true });
