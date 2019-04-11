# Node.js Paris talk (2019-04-10)

## Why and how connect Rust code to your Node.jds project ?

## Quick links

- [Meetup.com event](https://www.meetup.com/Nodejs-Paris/events/259760113/)
- [Slides](https://docs.google.com/presentation/d/19oJz0mV5bpiTzAQC5N2LsHub37Y_Ib5Tez2Mor9q0dM/edit?usp=sharing)
- [Source code](https://github.com/aymericbeaumet/nodejs-paris-talk-node-rust-neon)

## Getting started

Requirements:

- Node.js >= 11
- Rust
  - Install [Rustup](https://github.com/rust-lang/rustup.rs): `brew install rustup`
  - Specify the default toolchain as being stable: `rustup default stable`
  - Update the toolchain: `rustup update`

Getting the repo ready:

```bash
git clone https://github.com/aymericbeaumet/nodejs-paris-talk-node-rust-neon.git /tmp/nodejs-paris-talk-node-rust-neon
cd /tmp/nodejs-paris-talk-node-rust-neon
yarn # install node dependencies, and compile rust code
```

You can now run the benchmarks:

```bash
./suite-avoid-main-event-loop.js
./suite-javascript-versus-rust-round1.js
./suite-javascript-versus-rust-round2.js
```

## Output

```bash
./suite-avoid-main-event-loop.js && ./suite-javascript-versus-rust-round1.js && ./suite-javascript-versus-rust-round2.js
```

```
First, we want to know what is the performance impact to run synchronous
code inside/outside the main event loop. What we want to highlight with this
benchmark is that solutions exist when synchronous code need to be run, but
they come at a price.

    Main event loop x 1,748 ops/sec ±1.19% (86 runs sampled)
    Child process x 1,558 ops/sec ±1.26% (78 runs sampled)
    Worker thread x 1,673 ops/sec ±0.80% (84 runs sampled)
    -> Fastest is Main event loop

The main event loop is indeed the fastest, as expected. The child processes
and worker threads have to take orders and communicate their results from/to
the main thread, meaning they are limited by the speed at which they can
receive/send messages. That being said, the performance impact is acceptable
considering it enables to stop polluting the event loop with non-trivial
synchronous operations.

We have now confirmed there is a communication cost when leveraging child
processes or worker threads. However this allows to execute compute intensive
synchronous operations in these environments without blocking the main event
loop.

So now we have the choice to either run blocking JavaScript code, or
something else. Some languages are very efficient when it comes to CPU-bound
operations, like C, C++ or Rust. I like Rust, let's see whether there is a
clear win performance-wise. Let's try with the factorial function!

    JavaScript synchronous x 12,062,650 ops/sec ±0.58% (87 runs sampled)
    Rust synchronous x 1,041,039 ops/sec ±0.81% (89 runs sampled)
    -> Fastest is JavaScript synchronous

Ah! What we see here is that while the factorial function is CPU bound, it is
not expensive enough to justify switching to a Rust implementation, the back
and forth between JavaScript and Rust are too expensive to make this a viable
solution.

What we want is a more compute intensive function. Let's try the Leibniz
formula, which allows to approximate the decimals of Pi
(https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80): it is
inefficient, easy to implement, and allow an arbitrary number of iterations,
all of this while keeping the result in a single float. This makes it ideal
for our use case.

    JavaScript pi x 1,799 ops/sec ±0.57% (88 runs sampled)
    Rust pi x 2,814 ops/sec ±0.59% (88 runs sampled)
    Rust pi parallel x 4,157 ops/sec ±1.93% (85 runs sampled)
    -> Fastest is Rust pi parallel

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
```
