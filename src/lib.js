exports.factorial = function factorial(n) {
  let result = 1;
  for (let i = 1; i <= n; i += 1) {
    result *= i;
  }
  return result;
};

exports.pi = function pi(n) {
  const step = 4;
  const max = n * step;
  let pi = 0;
  let i = 1;
  while (i < max) {
    pi += 4 / i - 4 / (i + 2);
    i += step;
  }
  return pi;
};
