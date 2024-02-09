/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
	return /^B62[1-9A-HJ-NP-Za-km-z]{52}$/.test(param);
}
