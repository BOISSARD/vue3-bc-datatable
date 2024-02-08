import { filtersFunctions } from "../src/components/types"


const values = {
	// Nullish
	"Nullish": [null, undefined],
	// Boolean
	"Boolean": [true, false, "true", "false"],
	// Number
	"Number": [
		0, -0, 1, -1, 1000, -100, 3.1415, 12n, 5e10,
		"0", "-0", "1", "-1", "1000", "-100", "3.1415", "12n", "5e10",
		NaN, Infinity, -Infinity
	],
	// String
	"String": ["value", "99999"],
	// Array
	"Array": [[], ["val1", "val2"], [1, 2], ["val", 0, null, 1111]],
	// Date
	"Date": [Date.now(), new Date(), new Date(2020, 6, 10), new Date(2000, 2, 5, 14, 23, 50, 234), new Date("2021-02-29")],
	// Object
	"Object": [{}, null, { yolo: 2 }],
}
console.log(values)

describe('filtersFunctions it : Is Truthy ', () => {
	
	const cases = [
		// Nullish
		[null, false], [undefined, false],
		// Boolean
		[true, true], [false, false], ["true", true], ["false", true],
		// Number
		[0, false], [-0, false], [1, true], [-1, true], [1000, true], [-100, true], [3.1415, true], [12n, true], [5e10, true],
		["0", true], ["-0", true], ["1", true], ["-1", true], ["1000", true], ["-100", true], ["3.1415", true], ["12n", true], ["5e10", true],
		[NaN, false], [Infinity, true], [-Infinity, true],
		// String
		["", false], ["value", true], ["99999", true],
		// Array
		[[], true], [["val1", "val2"], true], [[1, 2], true], [["val", 0, null, 1111], true],
		// Date
		[Date.now(), true], [new Date(), true], [new Date(2020, 6, 10), true], [new Date(2000, 2, 5, 14, 23, 50, 234), true],
		// Object
		[{}, true], [null, false], [{ yolo: 2 }, true]
	]

	// @ts-ignore
	test.each(cases)("filtersFunctions.it(%p) = %p", (value: any, expected: boolean) => {
		expect(filtersFunctions.it(value)).toBe(expected)
	})

});

describe('filtersFunctions in : Is Nullish ', () => {
	
	const cases = [
		// Nullish
		[null, true], [undefined, true],
		// Boolean
		[true, false], [false, false], ["true", false], ["false", false],
		// Number
		[0, false], [-0, false], [1, false], [-1, false], [1000, false], [-100, false], [3.1415, false], [12n, false], [5e10, false],
		["0", false], ["-0", false], ["1", false], ["-1", false], ["1000", false], ["-100", false], ["3.1415", false], ["12n", false], ["5e10", false],
		[NaN, false], [Infinity, false], [-Infinity, false],
		// String
		["", false], ["value", false], ["99999", false],
		// Array
		[[], false], [["val1", "val2"], false], [[1, 2], false], [["val", 0, null, 1111], false],
		// Date
		[Date.now(), false], [new Date(), false], [new Date(2020, 6, 10), false], [new Date(2000, 2, 5, 14, 23, 50, 234), false],
		// Object
		[{}, false], [null, true], [{ yolo: 2 }, false]
	]

	// @ts-ignore
	test.each(cases)("filtersFunctions.in(%p) = %p", (value: any, expected: boolean) => {
		expect(filtersFunctions.in(value)).toBe(expected)
	})

});

describe('filtersFunctions eq : Equals', () => {

	const cases = [
		// { value: null, comparisons: [ [null, true], [undefined, true], [null, true], [0, true], [-0, true], ["", true], ] },
		["any", null, true],
		["any", undefined, true],
		
	]

	// test.each(cases)("filtersFunctions.eq($value, COMPARISON) for $comparisons", ({value, comparisons}: any) => {
	// 	comparisons.forEach(([comparison, expected]) => {
	// 		expect(filtersFunctions.eq(value, comparison)).toBe(expected)
	// 	});
	// })

})