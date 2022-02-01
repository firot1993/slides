//! Benchmark-demo pallet benchmarking.

use frame_benchmarking::{benchmarks, account};
use frame_system::RawOrigin;

benchmarks!{
	create {
		let x in 1 .. 1000;
		let caller = account("caller", 0, 0);
	}: _ (RawOrigin::Signed(caller), x.into())
	verify {
	}
}
