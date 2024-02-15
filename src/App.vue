<template>

<h1>Examples</h1>
<div id="options" :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }">
	<div class="switch"><input type="checkbox" v-model="debug"><label>debug</label></div>
	<!-- <div class="switch"><input type="checkbox" v-model="dense"><label>dense</label></div> -->
	<div class="switch"><select v-model="density">
		<option value="null">Automatique (null)</option>
		<option value="100">Nombre 100</option>
		<option value="compact">Compact</option>
		<option value="default">Default</option>
		<option value="comfortable">Comfortable</option>
		</select><label>dense</label> : {{ densities[density] ?? "null" }}</div>
	<div class="switch"><input type="checkbox" v-model="empty"><label>clear items ?</label></div>
	<div class="switch"><input type="checkbox" v-model="dark"><label>dark</label></div>
	<div class="switch"><input type="checkbox" v-model="loading"><label>loading</label></div>
</div>

<h2 id="tabEmpty">Empty datatable <input type="checkbox" v-model="tabEmpty"></h2>
<Datatable identifier="empty" v-if="tabEmpty" 
	title="Tableau Vide"
	:debug="debug"
	:density="densities[density]"
	:dark="dark"
	:loading="loading"
/>


<h2 id="tabMinimal">Minimal datatable <input type="checkbox" v-model="tabMinimal"></h2>
<div v-if="tabMinimal">
	<Datatable v-if="true"
		identifier="tabMinimal"
		title="Tableau Minimal"
		
		:columns="headers"
		:rows="empty ? [] : items"
		propId="name"

		displayFilters
		displayFooter

		multiSort
		density="compact"
		
		:dark="dark"
		:loading="loading"
	/>
</div>


	<template v-if="tabSimple || tabSloted ||tabFew">
	<div :style="{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', margin: '60px 0 15px' }">
		<div :style="{ flex: '0 0 auto' }"> <button @click="addCol" >Add Col</button> </div>
		<div :style="{ flex: '0 0 auto' }"> <button @click="update2ndCol" >Update 2nd col</button> </div>
		<div :style="{ flex: '0 0 auto' }"> <button @click="removeCol" >Remove last col</button> </div>
		<div :style="{ flex: '0 0 auto' }"> <button @click="addRow" >Add Row</button> </div>
		<div :style="{ flex: '0 0 auto' }"> <button @click="update1stRow" >Update 1st row</button> </div>
		<div :style="{ flex: '0 0 auto' }"> <button @click="removeRow" >Remove last row</button> </div>
		<div :style="{ flex: '0 0 auto' }" class="switch"> <input type="checkbox" v-model="multiSort"><label>Multi sort</label> </div>
		<div :style="{ flex: '0 0 auto' }" class="switch"> <input type="checkbox" v-model="hideCol"><label>Hide col name</label> </div>
	</div>
	<div :style="{ width: '100%' }">expanded : {{ expanded }}</div>
	<div :style="{ width: '100%' }">sorted : {{ sorted }}</div>
	<div :style="{ width: '100%' }">filters : {{ filters }} {{ filters }}</div>
	<div :style="{ width: '100%' }">selected : {{ selected }}</div>
	<!-- <code>{{ headers }}</code> -->
	<!-- <code>{{ items }}</code> -->
	</template>

<h2 id="tabSimple">Simple datatable <input type="checkbox" v-model="tabSimple"></h2>
<div v-if="tabSimple">
	<Datatable v-if="true"
		tableStyle="text-align: rightt; height: 450px;"

		identifier="tabSimple"
		title="Tableau Simple"
		
		:columns="headers"
		:rows="empty ? [] : items"
		propId="name"
		@displaying="displaying"
		
		displayFooter
		:density="densities[density]"
		:dark="dark"
		:loading="loading"
		:stick="{ header: true, footer: true }"
		:dividers="{ header: true, footer: true, body: false }"
		
		:debug="debug"

		v-model:select="selected"

		:multiSort="multiSort"
		v-model:sorts="sorted"		

		v-model:filters="filters"
		:displayFilters="true"
		
		v-model:expand="expanded"
	/>
</div>

<h2 id="tabFew">Few lines datatable <input type="checkbox" v-model="tabFew"></h2>
<div v-if="tabFew">
	<Datatable v-if="true"
		identifier="tabFew"
		title="Tableau peu de lignes"
		
		:columns="headers"
		:rows="empty ? [] : items.splice(0,2)"
		propId="name"
		
		displayFilters
	/>
</div>

<h2 id="tabSloted">Sloted datatable <input type="checkbox" v-model="tabSloted"></h2>
<div v-if="tabSloted">
<Datatable v-if="true"
	tableStyle="text-align: rightt; max-height: 400px;"

	identifier="tabSloted"
	title="Tableau Avec Slots"
	
	:columns="headers"
	:rows="empty ? [] : items"
	propId="name"
	@displaying="displaying"
	
	displayFooter
	:density="densities[density]"
	:dark="dark"
	:loading="loading"
	:stick="{ header: true, footer: true }"
	:dividers="{ header: 'thick double red' }"
	
	:debug="debug"

	:multiSort="multiSort"
	v-model:sort="sorted"
	
	v-model:select="selected"

	v-model:filters="filters"
	
	v-model:expand="expanded"
>

	<template #title="{ title, rows, displaying }">
		<h3 :style="{ margin: '10px 25px', fontSize: '1.8rem', fontFamily: 'cursive' }">{{ title }} <span style="font-size: 1.1rem; padding-left: 20px">({{ displaying.length }}/{{ rows.length }} lignes affichées)</span></h3>
	</template>
	<!-- <template #top>
		<input v-model="search" style="display: block; width: calc(100% - 50px); margin: auto;">
	</template> -->
	<!-- <template #progress="{ dense: densed, dark: darken }" class="px-1">
		<v-progress-linear color="primary" :height="densed ? 3 : 6" :dark="darken" indeterminate rounded striped />
	</template> -->
	<template #progress="{ density: densed, dark: darken }">
		density: {{ densed }} dark: {{ darken }}
		<div style="width: 100%; text-align: center; font-size: 1.3rem;" class="divider">Loading...</div>
	</template>

	<!-- <template #default="{ columns, displaying }">{{ columns }}<br>{{ displaying }}</template> -->
	
<!-- #region ColGroups -->
	<!-- <template #colgroups="{ columns }">
		<colgroup span="2" style="background-color: rgba(200, 0, 0, 0.3);">
			<col width="300px">
		</colgroup>
		<col v-for="col of columns.slice(1)" :key="col.id" width="" :style="{'visibility': col.id == 'dairy' ? 'collapse' : 'visible' }">
	</template> -->
	<!-- <template #col-name><col style="background-color: rgba(150, 20, 50, 0.3);" width="300px"><col></template> -->
	<!-- <template #col-dairy><col style="visibility: collapse;"></template> -->
<!-- #endregion ColGroups -->
	
	<!-- <template #header="{ columns }"><tr :style="{ border: '2px solid red', padding: '5px' }" ><td :colspan="columns.length">{{ columns.map(c => c.property ?? c.id) }}</td></tr></template> -->
	<!-- <template #header-tr="{ columns }"><td :colspan="columns.length">{{ columns.map(c => c.id) }}</td></template> -->
	<!-- <template #header-dairy="{ class: classes, style: styles }"><th style="background-color: rgba(40, 120, 50, 0.3); border: 2px dashed blueviolet;" :style="styles" :class="classes">DAIRY ?</th></template> -->
	
	<!-- <template #body="{ displaying, columns }"><tr><td :colspan="columns.length" style="background-color: initial;">{{ displaying }}</td></tr></template> -->

	<template #row-Lollipop="{ row, columns }"><td colspan="2" style="text-align: center;" :style="{ fontSize: '1.2rem' }">la ligne de Lollipop</td><td :colspan="columns.length -2" style="text-align: center;" >{{ row }}</td></template>

	<template #cell-iron="{ row, value, column }"><td style="text-align: right;" :style="{backgroundColor: row[column.property] > 0.25 ? 'rgba(210, 0, 0, 0.25)' : row[column.property] > 0.1 ? 'rgba(255, 150, 20, 0.25)' :'rgba(0, 220, 10, 0.25)' }" >{{ value }} %</td></template>
	<template v-slot:[`col-carbs-row-Jelly_bean`]="{ column, row, value, expanded, expand }"><th style="text-align: right; cursor: pointer" @click="expand(expanded, column, row)">{{ value }} g</th></template>

	<template #rows-expansions="{ column, columns }"><td colspan="1">Expansion :</td><td :colspan="columns.length -1" style="text-align: right;" > {{ column }}</td></template>
	<template #rows-expansion-carbs="{ columns }"><td :colspan="columns.length" style="text-align: center; background-color: lightcyan;" >expansion CARBS</td></template>
	<template #row-Eclair-expansion-carbs="{ columns }"><td :colspan="columns.length" style="text-align: center; background-color: lightgoldenrodyellow;" >expansion CARBS pour l'ECLAIR</td></template>

	<template #no-data="{ columns }"><td :colspan="columns.length" :style="{ textAlign: 'center' }">NO DATA</td></template>
	
	<template #footer-iron="{ value, class: classes, style }"><th :style="{...style, textAlign: 'left', backgroundColor: value > 25 ? 'rgba(244, 191, 191, 0.25)' : value > 10 ? 'rgba(255, 229, 196, 1)' : 'rgba(191, 246, 194, 1)' }" :class="classes">{{ value }} %</th></template>
	<template v-slot:[`footer-category`]="{ class: classes, style }"><td colspan="2" style="box-sizing: border-box;border: 4px dashed blueviolet;" :style="style" :class="classes">Nothing here</td></template>
	<!-- <template #footer="{ columns }"><tr><td :colspan="columns.length" style="background-color: lightblue;">{{ columns.map(c => c.id) }}</td></tr></template> -->
	<!-- <template #footer-tr="{ columns }"><td :colspan="columns.length" style="background-color: lightblue;">{{ columns.map(c => c.id) }}</td></template> -->
</Datatable>
</div>

<h2 id="tabNested">Nested datatable <input type="checkbox" v-model="tabNested"></h2>
<div v-if="tabNested">
<!-- {{ itemsCredit[0].date.getFullYear() }} -->
<Datatable v-if="tabNested"
	identifier="tabNested"

	:columns="headersCredit"
	:rows="itemsCredit"
	propId="id"

	:density="densities[density]"
	:dark="dark"
	:loading="loading"

	:debug="debug"

	:dividers="true"

	@expanded="console.log('@expanded',$event)"
/>

</div>

<br style="margin-top: 20px">
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import moment from "moment"

import { Datatable, DatatableColumn, DatatableFilter, DatatableRow, DatatableSelection, DatatableSort } from "./components"

const debug = ref(false)
const densities = { "100": 100, "null": null, "default": "default", "compact": "compact", "comfortable": "comfortable" }
const density = ref("default")
const empty = ref(false)
const dark = ref(false)
const loading = ref(false)
const multiSort = ref(true)
const hideCol = ref(false)

const tabEmpty = ref(false)
const tabMinimal = ref(false)
const tabFew = ref(false)
const tabSimple = ref(true)
const tabSloted = ref(false)
const tabNested = ref(false)

//#region		Table with desserts
// const sorted = ref<DatatableSort>([{ column: 'calories', desc: true }, { column: 'fat', desc: true }])
const sorted = ref<DatatableSort>({ 'calories': { desc: true, position: 1 }, 'fat': { desc: true } })
// const filters = ref<DatatableFilter>([{ column: "name", method: "Equals", value: "ea" }])
const filters = ref<DatatableFilter>({ 'name': { method: "Contains", value: "" }, 'carbs': { method: "Greater Than", value: "" } }) // "Greather Than or Equal"
const expanded = ref({ 'calories': ['Lollipop'], 'fat': ['Gingerbread'] })
const selected = ref<DatatableSelection>(["Eclair", "Donut", "Cupcake"])

// const headers = computed<Partial<DatatableColumn>[]>(() => ([
const headers = ref<Partial<DatatableColumn>[]>([
	{ 	id:"id_selection", 
		selection: { single: false, global: true }, filter: false,
		header: { cols: "auto", justify: "center" }, 
		body: { cols: "auto", justify: "center" }, 
		footer : { cols: "auto", justify: "end", displayExpanse: true, displaySelect: true, displaySort: false }, 
		dividerLeft: false, dividerRight: false, 
		sticky: { position: "left" }, 
		expansion: { global: true }, 
	},
	{
		property: 'name',
		columnStyle: { width: '300px' },
		header: { text: 'Dessert (100g serving)', },
		headerStyle: { color: "red", fontSize: '1.2rem', 'font-weight': '900' },
		footer: { text: (desserts:string[]) => `Total : ${desserts.length} desserts` },
		footerStyle: { color: "green", fontSize: '1.1rem', 'font-weight': '700' },
		bodyStyle: { fontStyle: 'italic' },
		sort: (a:string, b:string) => a.length - b.length,
		sticky: { position: "left", distance: "50px" },
		dividerLeft: true, dividerRight: true, 
		hidden: hideCol.value
	},
	{ property: 'dairy', header: { text: 'Dairy', }, body: { text: (val:boolean) => val ? "Yes" : "No" }, bodyStyle: { textAlign: 'right' }, footer: { text: (dairies:boolean[]) => `${countBy(dairies)['true'] ?? 0}/${dairies.length}` }, footerStyle: { textAlign: 'center' } },
	{ property: 'date', header: { text: 'Date', }, body: { text: (val: Date) => val?.toLocaleDateString() }, bodyStyle: { textAlign: 'center' }, footer: { text: 'Date' }, footerStyle: { textAlign: 'center' } },
	{ property: 'calories', header: { text: 'Calories' }, footer: { text: average, /*cols: "auto", justify: "end"*/ }, footerStyle: { textAlign: "center" }, bodyStyle: { fontStyle: 'italic', textAlign: "center" }, expansion: { text: "La calorie c'est cool", global: false, single: true } },
	{ property: 'fat', header: { text: 'Fat', justify: "end" }, headerStyle: { textAlign: "center" }, footer: { text: average, suffix: "g", cols: "auto", justify: "end" }, footerStyle: { textAlign: "center" }, body: { suffix: "g", cols: "auto", justify: "space-between" }, expansion: { text: "Le gras c'est pas cool" }, },
	{ property: 'carbs', header: { text: 'Carbs', justify: "end" }, headerStyle: { textAlign: "center" }, footer: { text: average, suffix: "g", cols: "auto", justify: "end" }, footerStyle: { textAlign: "center" }, body: { suffix: "g", cols: "auto", justify: "end" }, expansion: { property: "dairy", text: (val,item) => `${val} ${JSON.stringify(item)}`, global: true } },
	{ property: 'protein', header: { text: 'Protein', justify: "end" }, headerStyle: { textAlign: "center" }, footer: { text: average, suffix: "g", cols: "auto", justify: "end" }, footerStyle: { textAlign: "center" }, body: { suffix: "g", cols: "auto", justify: "end" }, },
	{ property: 'iron', header: { text: 'Iron', justify: "end" }, headerStyle: { textAlign: "center" }, footer: { text: (irons:number[]) => Math.round(average(irons)*10000)/100, suffix: "%", cols: "auto", justify: "end" }, footerStyle: { textAlign: "center" }, body: { text: (iron:number) => Math.round(iron*10000)/100, suffix: "%", cols: "auto", justify: "end" } },
	{ property: 'category', header: { text: 'Category' }, footer: { text: (categories: string[]) => [...new Set(categories)].length, suffix: "catégories" }, footerStyle: { textAlign: "center" }, sticky: "right", dividerLeft: true },
	// { header : { text: 'Actions' }, sticky: "right", sort: false }
])
watch(hideCol, () => {
	if(headers.value.length > 2)
		headers.value[1].hidden = hideCol.value
})
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

type Item = { name:string, calories:number, fat:number, carbs:number, protein:number, iron:number, category:string, dairy:boolean } | { [key:string]: any }
const items = ref<Array<Item>>([
	{ name: 'Lollipop', calories: 392, fat: 0.2, carbs: 98, protein: 0, iron: 0.02, category: 'Candy', dairy: false }, // , style: { height: "100px", border: "thin solid red" } // , date: new Date(1997, 11, 31, 22)
	{ name: 'Cupcake', calories: 575, fat: 3.7, carbs: 167, protein: 4.3, iron: 0.08, category: 'Pastry', dairy: true, date: new Date(1993, 3, 9, 12)},
	{ name: 'Jelly bean', calories: 575, fat: 8.0, carbs: 84, protein: 0.0, iron: 0, category: 'Candy', dairy: false, date: new Date(2001, 2, 17, 17) },
	{ name: 'KitKat', calories: 518, fat: 26.0, carbs: 65, protein: 7, iron: 0.06, category: 'Candy', dairy: true, date: new Date(2023, 8, 3, 4), dividerTop: true, dividerBottom: true },
	{ name: 'Donut', calories: 452, fat: 25.0, carbs: 51, protein: 4.9, iron: 0.22, category: 'Pastry', dairy: true, date: new Date(2021, 3, 13, 17) },
	{ name: 'Honeycomb', calories: 408, fat: 3.2, carbs: 87, protein: 6.5, iron: 0.45, category: 'Toffee', dairy: false, date: new Date(2023, 6, 24, 6) , dividerBottom: true, },
	{ name: 'Frozen Yogurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0, iron: 0.01, category: 'Ice cream', dairy: true, date: new Date(2021, 3, 21, 7), },
	{ name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9, iron: 0.16, category: 'Cookie', dairy: false, date: new Date(2024, 4, 10, 8), },
	{ name: 'Eclair', calories: 237, fat: 16.0, carbs: 23, protein: 6.0, iron: 0.075, category: 'Cookie', dairy: true, date:  new Date(2020, 3, 13, 17) },
	{ name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3, iron: 0.01, category: 'Ice cream', dairy: true, date: new Date(2003, 6, 24, 6) },
])

function addCol(){
	let name = 'Col-'+Math.random().toString(36).substring(2,7)
	headers.value.push({ property: name, header: { text: name }, footer: { text: average }, footerStyle: { textAlign: 'center', } })
	items.value.forEach(item => {
		item[name] = Math.round(Math.random()*100)
	});
}
function update2ndCol() {
	const index = 1
	if(headers.value?.[index]) {
		headers.value[index].dividerRight = !headers.value?.[index]?.dividerRight
		headers.value[index].dividerLeft = !headers.value?.[index]?.dividerLeft
	}
}
function removeCol() {
	headers.value.pop()
}
function addRow(){
	let item: DatatableRow = new DatatableRow()
	headers.value.forEach(header => {
		if (header.property == "name") item.name = 'Test-'+Math.random().toString(36).substring(2,7) 
		else if(header.property) {
			// console.log(header.property, item[header.property], item[header.property]?.constructor)
			item[header.property] = Math.round(Math.random()*1000)/10
		}
	})
	items.value.push(item as unknown as Item)
}
function update1stRow() {
	const index = 0
	if(items.value?.[index])
		items.value[index].dairy = !items.value?.[index]?.dairy
}
function removeRow() {
	items.value.pop()
}
function displaying(event) {
	if(event) {	
		// console.log(`Displaying ${event.length} rows :`, event?.length)
	}
}
//#endregion	Table with desserts

//#region		Nested Table
import interets from "./interets.json";
// @ts-ignore
const headersCredit = ref<Array<DatatableColumn>>([
	{
		expansion: { 
			global: true,
			//*
			columns : [
				{ sort: false, columnStyle: { width: "10%" }, },
				{ property: "date", header: { text: "Mois" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => moment(val).format("MMMM") } , sort: (a, b) => a.getMonth() - b.getMonth(), },
				{ property: "mensualite", header: { text: "Mensualité" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => (val.toFixed(2) + " €"), justify: "end" }, bodyStyle: { textAlign: "right" }, },
				{ property: "amortissement", header: { text: "Capital amortis" }, headerStyle: { textAlign: "center" }, value: "amortissement", columnStyle: { width: "18%", }, body: { text: val => (val.toFixed(2) + " €"), justify: "end" }, bodyStyle: { textAlign: "right" }, },
				{ property: "interet", header: { text: "Interets" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => (val.toFixed(2) + " €"), justify: "end" }, bodyStyle: { textAlign: "right" }, },
				{ property: "assurance", header: { text: "Assurance" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => (val.toFixed(2) + " €"), justify: "end" }, bodyStyle: { textAlign: "right" }, }
			], //*/
			property: "mensualites",
			hideHeader: true,
			style: { margin: '4px 0' },
		}, 
		body: { justify: "end" },
		bodyStyle: { textAlign: "center" },
		columnStyle: { width: "10%" },
		sort: false,
	},
	{ property: "date", header: { text: "Année/Mois", justify: "center" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => val?.getFullYear?.() }, bodyStyle: { textAlign: "right" }, sort: (a, b) => a.getTime() - b.getTime(),  },
	{ property: "annuite", header: { text: "Annuité/Mensualité", justify: "center" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => (val.toFixed(2) + " €"), justify: "end" }, bodyStyle: { textAlign: "right" }, },
	{ property: "amortissement", header: { text: "Capital amortis", justify: "center" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => (val.toFixed(2) + " €"), justify: "end" }, bodyStyle: { textAlign: "right" }, },
	{ property: "interet", header: { text: "Interets", justify: "center" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => (val.toFixed(2) + " €"), justify: "end" }, bodyStyle: { textAlign: "right" }, },
	{ property: "assurance", header: { text: "Assurance", justify: "center" }, headerStyle: { textAlign: "center" }, columnStyle: { width: "18%", }, body: { text: val => (val.toFixed(2) + " €"), justify: "end" }, bodyStyle: { textAlign: "right" }, },
])
const itemsCredit = computed<Array<DatatableRow>>(() => {
	var years = {};
	for(let interet of interets) {
		let date = new Date(interet.date);
		// @ts-ignore
		interet.id = "annee" + date.getFullYear() + date.getMonth()
		if (!years["annee" + date.getFullYear()])
			years["annee" + date.getFullYear()] = {
				id: "annee" + date.getFullYear(),
				date: date,//.getFullYear(),
				annuite: 0,
				amortissement: 0,
				interet: 0,
				assurance: 0,
				mensualites: []
			};
		years["annee" + date.getFullYear()].annuite += interet.mensualite;
		years["annee" + date.getFullYear()].amortissement += interet.amortissement;
		years["annee" + date.getFullYear()].interet += interet.interet;
		years["annee" + date.getFullYear()].assurance += interet.assurance;
		years["annee" + date.getFullYear()].mensualites.push(interet);
	}
	// console.log(Object.values(years))
	return Object.values(years);
})


//#endregion	Nested Table

</script>

<style lang="scss">
:root {
    // --bcdatatable-border-options: thick solid;
    // --bcdatatable-border-color-light: red;
    // --bcdatatable-border-color-dark: hsla(0, 0%, 100%, 0.12);
}

h2 {
	display: flex;
	align-items: center;
	margin-top: 50px;
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
	margin: 0 6px;
	font-size: 1.2rem;
	border-radius: 10px;
}
input[type="checkbox"] {
	width: 1.2rem;
	height: 1.2rem;
	margin: 0 6px;
}
select {
	margin: 0 6px;
	height: 2rem;
}

.switch {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
}

</style>
