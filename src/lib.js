const N = 100;
const STEPS = 10;

exports.synchronous = function synchronous() {
  let result = 1;
  for (let i = 1; i <= N; i++) {
    result *= i;
  }
  return result;
};

exports.asynchronous = function asynchronous(i, result, done) {
  const lim = i + STEPS - (i % STEPS);
  for (; i <= lim; i++) {
    result *= i;
  }
  return i >= N ? done() : setTimeout(() => asynchronous(i, result, done), 0);
};
