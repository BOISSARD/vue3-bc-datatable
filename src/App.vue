<template>

<h1>Examples</h1>
<div id="options" :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }">
	<div class="switch"><input type="checkbox" v-model="debug"><label>debug</label></div>
	<div class="switch"><input type="checkbox" v-model="dense"><label>dense</label></div>
	<div class="switch"><input type="checkbox" v-model="empty"><label>clear items ?</label></div>
	<div class="switch"><input type="checkbox" v-model="dark"><label>dark</label></div>
	<div class="switch"><input type="checkbox" v-model="loading"><label>loading</label></div>
</div>

<h2>Empty datatable <input type="checkbox" v-model="tabEmpty"></h2>
<Datatable identifiant="empty" v-if="tabEmpty" 
	title="Tableau Vide"
	:debug="debug"
	:dense="dense"
	:dark="dark"
	:loading="loading"
/>

<h2>Simple datatable <input type="checkbox" v-model="tabSimple"></h2>
<div v-if="tabSimple">
<div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', marginBottom: '15px' }">
	<div :style="{ flex: '0 0 auto' }"> <button @click="addCol" >Add Col</button> </div>
	<div :style="{ flex: '0 0 auto' }"> <button @click="update1stCol" >Update 2nd col</button> </div>
	<div :style="{ flex: '0 0 auto' }"> <button @click="removeCol" >Remove last col</button> </div>
	<div :style="{ flex: '0 0 auto' }"> <button @click="addRow" >Add Row</button> </div>
	<div :style="{ flex: '0 0 auto' }"> <button @click="update1stRow" >Update 1st row</button> </div>
	<div :style="{ flex: '0 0 auto' }"> <button @click="removeRow" >Remove last row</button> </div>
	<div :style="{ flex: '1 0 auto' }"> <label>Search : </label><input type="text" v-model="search" > </div>
	<div :style="{ flex: '0 0 auto' }" class="switch"> <input type="checkbox" v-model="multiSort"><label>Multi sort</label> </div>
</div>
<div :style="{ width: '100%' }">expanded : {{ expanded }}</div>
<div :style="{ width: '100%' }">sorted : {{ sorted }}</div>
<div :style="{ width: '100%' }">filters : {{ search }} {{ filters }}</div>
<div :style="{ width: '100%' }">selected : {{ selected }}</div>
<Datatable 
	tableStyle="text-align: rightt; max-height: 400px;"

	identifiant="tabSimple"
	title="Tableau Simple"
	
	:columns="headers"
	:rows="empty ? [] : items"
	propId="name"
	@displaying="displaying"
	
	displayFooter
	:dense="dense"
	:dark="dark"
	:loading="loading"
	:stick="{ header: true, footer: true }"
	
	:debug="debug"

	:multiSort="multiSort"
	v-model:sort="sorted"
	
	v-model:select="selected"

	:search="search"
	v-model:filter="filters"
	
	v-model:expand="expanded"
/>
</div>

</template>

<script setup lang="ts">
import { ref } from "vue"

// import Datatable from "./components/datatable.vue"
import { Datatable, DatatableColumn, DatatableSelection } from "./components"

const debug = ref(true)
const dense = ref(false)
const empty = ref(false)
const dark = ref(false)
const loading = ref(false)
const multiSort = ref(false)

const tabEmpty = ref(false)
const tabSimple = ref(true)
const tabSloted = ref(true)
const tabNested = ref(true)

const sorted = ref([{ column: 'calories', desc: true }, { column: 'fat' }])
const search = ref("")
const filters = ref(null)
const selected = ref<DatatableSelection>(["Eclair", "Donut", "Cupcake"])
const expanded = ref({ 'calories': ['Lollipop'], 'fat': ['Gingerbread'] })

const headers = ref<Partial<DatatableColumn>[]>([
	{ id:"id_selection", selection: { single: false, global: true }, 
		body: { cols: "auto", justify: "center" }, dividerLeft: false, dividerRight: false, 
		header: { cols: "auto", justify: "center" }, 
		footer : { cols: "auto", justify: "end", displayExpanse: true, displaySelect: true, displaySort: false }, 
		expansion: { global: true }, sticky: { position: "left", zIndex: 2 }, 
	},
	{
		property: 'name',
		header: { text: 'Dessert (100g serving)', },
		headerStyle: { color: "red" },
		footer: { text: (desserts:string[]) => desserts.length },
		footerStyle: { color: "green" },
		bodyStyle: { fontStyle: 'italic' },
		sort: (a:string, b:string) => a.length - b.length,
		sticky: { position: "left", zIndex: 2, distance: "50px" },                
		dividerLeft: true, dividerRight: true, 
	},
	{ property: 'dairy', header: { text: 'Dairy', }, body: { text: (val:boolean) => val ? "Yes" : "No" }, bodyStyle: { textAlign: 'right' }, footer: { text: (dairies:boolean[]) => `${countBy(dairies)['true'] ?? 0}/${dairies.length}` }, footerStyle: { textAlign: 'center' } },
	{ property: 'calories', header: { text: 'Calories' }, footer: { text: average, /*cols: "auto", justify: "end"*/ }, footerStyle: { textAlign: "center" }, bodyStyle: { fontStyle: 'italic', textAlign: "center" }, expansion: { text: "La calorie c'est cool", global: false, single: true } },
	{ property: 'fat', header: { text: 'Fat', justify: "end" }, headerStyle: { textAlign: "center" }, footer: { text: average, suffix: "g", cols: "auto", justify: "end" }, footerStyle: { textAlign: "center" }, body: { suffix: "g", cols: "auto", justify: "space-between" }, expansion: { text: "Le gras c'est pas cool" }, },
	{ property: 'carbs', header: { text: 'Carbs', justify: "end" }, headerStyle: { textAlign: "center" }, footer: { text: average, suffix: "g", cols: "auto", justify: "end" }, footerStyle: { textAlign: "center" }, body: { suffix: "g", cols: "auto", justify: "end" }, expansion: { property: "dairy", text: (val,item) => `${val} ${JSON.stringify(item)}`, global: true } },
	{ property: 'protein', header: { text: 'Protein', justify: "end" }, headerStyle: { textAlign: "center" }, footer: { text: average, suffix: "g", cols: "auto", justify: "end" }, footerStyle: { textAlign: "center" }, body: { suffix: "g", cols: "auto", justify: "end" }, },
	{ property: 'iron', header: { text: 'Iron', justify: "end" }, headerStyle: { textAlign: "center" }, footer: { text: (irons:number[]) => Math.round(average(irons)*10000)/100, suffix: "%", cols: "auto", justify: "end" }, footerStyle: { textAlign: "center" }, body: { text: (iron:number) => Math.round(iron*10000)/100, suffix: "%", cols: "auto", justify: "end" } },
	{ property: 'category', header: { text: 'Category' }, footer: { text: (categories: string[]) => [...new Set(categories)].length, suffix: "catégories" }, footerStyle: { textAlign: "center" }, sticky: "right", dividerLeft: true },
	// { header : { text: 'Actions' }, sort: false }
])
function average(vals) {
    return Math.round((vals.reduce((a, b) => a + b, 0)/vals.length || 0)*100)/100
}
function countBy(array, iteratee = val => val) {
  return array.reduce((acc, value) => {
    const key = iteratee(value)
    if (!acc[key]) acc[key] = 0
    acc[key]++
    return acc
  }, {});
}

type Item = { name:string, calories:number, fat:number, carbs:number, protein:number, iron:number, category:string, dairy:boolean } | { [key:string]: number | undefined }
const items = ref<Array<Item>>([
	{ name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67, protein: 4.3, iron: 0.08, category: 'Pastry', dairy: true },
	{ name: 'Frozen Yogurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0, iron: 0.01, category: 'Ice cream', dairy: true },
	{ name: 'Lollipop', calories: 392, fat: 0.2, carbs: 98, protein: 0, iron: 0.02, category: 'Candy', dairy: false },
	{ name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9, iron: 0.16, category: 'Cookie', dairy: false, },
	{ name: 'Eclair', calories: 237, fat: 16.0, carbs: 23, protein: 6.0, iron: 0.075, category: 'Cookie', dairy: true },
	{ name: 'Jelly bean', calories: 375, fat: 0.0, carbs: 94, protein: 0.0, iron: 0, category: 'Candy', dairy: false, },
	{ name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3, iron: 0.01, category: 'Ice cream', dairy: true },
	{ name: 'Donut', calories: 452, fat: 25.0, carbs: 51, protein: 4.9, iron: 0.22, category: 'Pastry', dairy: true },
	{ name: 'Honeycomb', calories: 408, fat: 3.2, carbs: 87, protein: 6.5, iron: 0.45, category: 'Toffee', dairy: false },
	{ name: 'KitKat', calories: 518, fat: 26.0, carbs: 65, protein: 7, iron: 0.06, category: 'Candy', dairy: true, },
])

function displaying(event) {
	// console.log(`Displaying ${event.length} rows :`, event?.length)
}





</script>

<style lang="scss">

h2 {
	display: flex;
	align-items: center;
}

label, button {
	font-size: 1.2rem;
}

button {
	margin: 0 3px;
	padding: 4px 10px;
	border: none;
	border-radius: 10px;
	cursor: pointer;

	&:hover {
		background-color: lightgray;
	}
}
input[type="text"] {
	margin: 0 4px;
	font-size: 1.2rem;
	border-radius: 10px;
}
input[type="checkbox"] {
	width: 1.2rem;
	height: 1.2rem;
	margin: 0 6px;
}

.switch {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
}

</style>
