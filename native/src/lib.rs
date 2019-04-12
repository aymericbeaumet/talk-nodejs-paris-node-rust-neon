#[macro_use]
extern crate neon;
#[macro_use]
extern crate neon_serde;

use rayon::prelude::*;

export! {
    fn factorial(n: u64) -> u64 {
        let mut result = 1;
        for i in 1..=n {
            result *= i;
        }
        result
    }

    fn pi(n: f64) -> f64 {
        let step = 4.;
        let max = n * step;
        let mut pi = 0.;
        let mut i = 1.;
        while i < max {
            pi += 4. / i - 4. / (i + 2.);
            i += step;
        }
        pi
    }

    fn pi_parallel(n: u64) -> f64 {
        (1..(n / 4)).into_par_iter().map(|i| {
            let i = (i * 4) as f64;
            4. / i - 4. / (i + 2.)
        }).sum()
    }
}
