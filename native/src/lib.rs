#[macro_use]
extern crate neon;
#[macro_use]
extern crate neon_serde;

export! {
    fn synchronous(n: u64) -> u64 {
        let mut result = 1;
        for i in 1..=n {
            result *= i;
        }
        result
    }
}
