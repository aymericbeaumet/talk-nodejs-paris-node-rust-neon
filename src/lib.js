exports.factorial = function factorial(n) {
  let result = 1;
  for (let i = 0; i < n; i += 1) {
    result *= i;
  }
  result;
};

exports.pi = function pi(n) {
  let pi = 0;
  let i = 1;
  while (i < n) {
    pi += 4 / i - 4 / (i + 2);
    i += 4;
  }
  return pi;
};
