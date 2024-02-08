<!-- 
    Définition des slots : ✔ ✖

    slot pour la partie loading ✔

    slot pour le title
    slot pour le top
    slot pour la pagination
    slot pour le bottom

    slot par défaut pour le table entier (passer tous les bindings utiles)
        slot pour des colgroups
            slot pour l'unique colgroup
                slot pour chaque col
        slot pour le theader
            slot pour la ligne d'en-tête du tableau
                slot pour une colonne (cellule) du header 
        slot pour le tfooter
            slot pour la ligne de pied du tableau
                slot pour une colonne (cellule) du footer 
        slot pour le tbody
            slot pour toutes les lignes
                slot pour une ligne en particulier (par whatPropId)
                slot pour une colonne (toutes les cellules des lignes d'une même colonne)
            slot pour l'expansion
                slot pour les expansions d'une colonne
                slot pour les expansions d'une ligne
            slot pour le cas des rows vide (message nodata/noresult/loading)
        
        slot pour la selection :
            pour les lignes
            pour le header/footer

        slot pour l'expansion (à transmettre dans datatable-cell ?) :
            pour les cellules avec expansion
            pour le global header/footer
    
-->

<template>
    <div style="max-width: 100%" :class="{
        'theme--light': !dark,
        'theme--dark': dark,
        'pa-4 elevation-1 rounded table-wrapper': !nested,
    }">
        <div v-if="$slots.title || title" class="table-container-top">
            <slot name="title" v-bind="getThis"><span class="table-title">{{ title }}</span></slot>
        </div>
        <div v-if="$slots.top" class="table-container-top">
            <slot name="top"></slot>
        </div>

        <div style="overflow: auto; width: 100%" :style="tableStyle" :class="tableClass" class="table-parent" ref="tableWrapper" >
            <slot v-bind="getThis">

                <table 
                    style="table-layout: auto; min-width: 100%"
                    :style="tableStyle"
                    :class="{ 
                        'density-comfortable': density === 'comfortable', 
                        'density-compact': density === 'compact', 
                        divider: hasDivider(), 
                        ...tableClass 
                    }" 
                    ref="table"
                >

                    <DatatableHeaders v-if="!hideHeader" 
                        is="head" 
                        :identifiant="identifiant"
                        :headers="getColumns" 
                        :displaying="getRows" 
                        :select="selecting"
                        :style="{ ...getSticky('thead') }" 
                        :table="getThis"
                        :debug="debug" 
                    >
                        <template v-for="slotName of Object.keys($slots).filter((name) => name.startsWith('header'))" :key="slotName" #[slotName]="slotProps">
                            <slot :name="slotName" v-bind="slotProps" />
                        </template>
                    </DatatableHeaders>

                    <template v-if="loading">
                        <tr class="table-progress" :style="{ ...getSticky('thead') }">
                            <td :colspan="getColumns.length">
                                <slot name="progress" :loading="loading" :dark="dark" :density="density">
                                    <div class="table-progress-bar">
                                        <div />
                                    </div>
                                </slot>
                            </td>
                        </tr>
                    </template>

                    <tbody :class="{ divider: hasDivider('tbody') }">

                        <slot name="body" v-bind="getThis">

                            <template v-if="getRows.length" v-for="row in getRows" :key="getId(row)">

                                <tr :style="{ ...row.style }" :class="[ ...(row.class ?? []) ]">
                                    <slot :name="`row-${getId(row)}`" 
                                        :row="row" 
                                        :whatPropId="whatPropId"
                                        :columns="getColumns" 
                                        :displaying="getRows" 
                                        :format="format" 
                                        :expand="expanse"
                                    >
                                        <slot :name="`rows`" 
                                            :row="row" 
                                            :whatPropId="whatPropId" 
                                            :columns="getColumns" 
                                            :displaying="getRows"
                                            :format="format" 
                                            :expand="expanse"
                                        >

                                            <template v-for="column in getColumns" :key="generateKey(row, column)">

                                                <slot :name="`cell-${column.id}-row-${getId(row)}`" 
                                                    :row="row"
                                                    :whatPropId="whatPropId" 
                                                    :displaying="getRows" 
                                                    :column="column"
                                                    :columns="getColumns" 
                                                    :format="format" 
                                                    :expand="expanse"
                                                    :expandable="!!column.expansion"
                                                    :expanded="getExpandedValue(column, row)" :value="format(column, row)"
                                                >

                                                    <slot :name="`cell-${column.id}-body`" 
                                                        :row="row" 
                                                        :whatPropId="whatPropId"
                                                        :displaying="getRows" 
                                                        :column="column" 
                                                        :columns="getColumns"
                                                        :format="format" 
                                                        :expand="expanse" 
                                                        :expandable="!!column.expansion"
                                                        :expanded="getExpandedValue(column, row)"
                                                        :value="format(column, row)"
                                                    >

                                                        <DatatableCell v-if="!column.hidden"
                                                            :id="generateKey(row, column)"
                                                            :value="format(column, row)" 
                                                            v-bind="column.body"
                                                            :class="[...column.columnClass, column.bodyClass, { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight, 'divider-top': row.dividerTop, 'divider-bottom': row.dividerBottom }, ]" 
                                                            :style="{ ...column.columnStyle, ...column.bodyStyle, ...getSticky(column), ...getRowHeightFromDensity }"
                                                            :selectable="!!column.selection"
                                                            :selected="getSelect(column)?.includes(getId(row))"
                                                            @update:selected="select(column, row, $event)"
                                                            :expandable="!!column.expansion"
                                                            :expanded="getExpandedValue(column, row)"
                                                            @update:expanded="expanse($event, column, row)"
                                                            :debug="debug" 
                                                        >
                                                        </DatatableCell>

                                                    </slot>

                                                </slot>

                                            </template>

                                        </slot>
                                        
                                    </slot>
                                </tr>

                                <tr v-for="({ expansion, column, length }, i) in Object
                                        .entries(getExpanded)
                                        .map(([key, val]) => val[getId(row)] ? { expansion: key, column: getColumns.find((col) => col.id == key), row: val, } : null)
                                        .filter((kv) => !!kv)
                                        .map((kv, _, arr) => { kv.length = arr.length; return kv; })
                                    " 
                                    :key="`${getId(row)}-expansion-${expansion}`" 
                                    :class="{ 'table-expansion-row': !hasExpansion(expansion), 'table-expansion-nested-row': hasExpansion(expansion), }"
                                >

                                    <slot :name="`row-${getId(row)}-expansion-${expansion}`" :row="row"
                                        :whatPropId="whatPropId" :expanse="expanse" :displaying="getRows" :column="column"
                                        :columns="getColumns">

                                        <slot :name="`rows-expansion-${expansion}`" :row="row" :whatPropId="whatPropId"
                                            :expanse="expanse" :displaying="getRows" :column="column" :columns="getColumns">

                                            <slot :name="`rows-expansions`" :row="row" :whatPropId="whatPropId"
                                                :expanse="expanse" :displaying="getRows" :column="column"
                                                :columns="getColumns">

                                                <td v-if="hasExpansion(expansion)" 
                                                    :colspan="getColumns.length" 
                                                    :class="{ 'table-expansion-first-row': i == 0 && length > 1, 'table-expansion-last-row': i == length - 1 && length > 1, 'table-expansion-only-row': length == 1, }" 
                                                    :style="{ ...getSticky(column) }"
                                                >
                                                    <RerenderChecker v-if="debug" :id="generateKey(`${identifiant}_${expansion}-${getId(row)}`,'table-nested')" ></RerenderChecker>
                                                    <Datatable 
                                                        nested 
                                                        class="table-nested"
                                                        :identifiant="`${identifiant}_${expansion}-${getId(row)}`"
                                                        :columns="column.expansion.columns"
                                                        :rows="format(column, row, 'expansion')" 
                                                        :density="density" 
                                                        :dark="dark"
                                                        :loading="loading" 
                                                        :debug="debug" 
                                                        v-bind="column.expansion"
                                                    />
                                                </td>
                                                <DatatableCell v-else 
                                                    :id="generateKey(`expansion-${identifiant}_${expansion}-${getId(row)}`, column)"
                                                    :colspan="getColumns.length" 
                                                    :class="[
                                                        { 'table-expansion-first-row': i == 0 && length > 1, 'table-expansion-last-row': i == length - 1 && length > 1, 'table-expansion-only-row': length == 1, }, 
                                                        //...(row.class ?? [])
                                                    ]" 
                                                    :style="{ ...getSticky(column), ...getRowHeightFromDensity, }" 
                                                    :value="format(getColumns.find((col) => col.id == expansion), row, 'expansion')" 
                                                    :debug="debug" 
                                                >
                                                </DatatableCell>
                                            </slot>

                                        </slot>

                                    </slot>

                                </tr>

                            </template>

                            <template v-else>
                                <tr class="table-empty-row">
                                    <slot name="no-data" 
                                        :filters="filters" 
                                        :loading="loading" 
                                        :columns="getColumns"
                                        :displaying="getRows"
                                        :message="filters ? noResultsMessage : loading ? loadingMessage : noDataMessage"
                                    >
                                        <td :colspan="getColumns.length" class="table-empty-row-cell font-weight-medium">
                                            {{ filters ? noResultsMessage : loading ? loadingMessage : noDataMessage }}
                                            <RerenderChecker v-if="debug" :id="generateKey(`${identifiant}`,'messages')" />
                                        </td>
                                    </slot>
                                </tr>
                            </template>
                        </slot>
                    </tbody>

                    <DatatableHeaders v-if="displayFooter" 
                        is="foot" 
                        :identifiant="identifiant"
                        :headers="getColumns" 
                        :displaying="getRows" 
                        :select="selecting"
                        :style="{ ...getSticky('tfoot') }" 
                        :table="getThis"
                        :debug="debug"
                    >
                        <template v-for="slotName of Object.keys($slots).filter((name) => name.startsWith('footer'))" :key="slotName" #[slotName]="slotProps">
                            <slot :name="slotName" v-bind="slotProps" />
                        </template>
                    </DatatableHeaders>

                </table>

            </slot>
        </div>

        <div v-if="$slots.pagination" class="table-container-bottom">
            <slot name="pagination"></slot>
        </div>
        <div v-if="$slots.bottom" class="table-container-bottom">
            <slot name="bottom"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
//#region   Imports
import { computed, ref, watch, isRef, isReactive, toRaw, unref } from "vue";
import { merge, cloneDeep } from "../utils/object";
import { getCommonType } from "../utils/array";
import {
    DatatableHeaders,
    DatatableCell,
    ClassProps,
    DatatableColumn,
    DatatableDraggable,
    DatatableExpansion,
    DatatableFilter,
    DatatableGroup,
    DatatablePagination,
    DatatablePropertyId,
    DatatableResizable,
    DatatableRow,
    DatatableSelection,
    DatatableSort,
    DatatableSticky,
    StyleProps,
DatatableDividers,
DatatableColumnSort,
DatatableColumnFilter,
filtersLabels,
} from ".";
import RerenderChecker from "./rerender-checker.vue"
// #endregion

//#region       ###    Props       ###
const props = withDefaults(
    defineProps<{
        // ** Identification
        identifiant?: string;
        title?: string;
        // ** Définition des données
        columns?: null | Partial<DatatableColumn>[]; // Definition des colonnes
        rows?: null | Partial<DatatableRow>[]; // les Données du tableau
        propId?: DatatablePropertyId; // Colonne dont la valeur sert d'id
        // ** Gestion des données
        loading?: boolean; // Loading pour informer de la modification des données
        loadingMessage?: string; // Message lors du chargement des données (si aucune données à afficher)
        noDataMessage?: string; // Message si aucune données à la fin du chargement
        noResultsMessage?: string; // Message si aucune données suite à une interaction (filter)
        // ** Interaction avec le tableau
        sorts?: DatatableSort; // La manière dont est trié le tableau au départ
        multiSort?: boolean;
        group?: DatatableGroup; // La manière dont sont groupées les lignes du tableau par une colonne
        // search?: string;
        filters?: DatatableFilter; // La manière dont sont filtrées les lignes du tableau
        expand?: DatatableExpansion; // La manière dont sont étendus les lignes de certaines colonnes
        select?: DatatableSelection; // la manière dont selectionner des lignes
        // ** headers to footers
        hideHeader?: boolean;
        displayFilters?: boolean;
        pagination?: DatatablePagination; //
        displayFooter?: boolean;
        stick?: DatatableSticky;
        // ** Design
        density?: 'default' | 'comfortable' | 'compact' | number | null;
        dark?: boolean;
        dividers?: DatatableDividers;
        tableStyle?: StyleProps;
        tableClass?: ClassProps;
        // ** Features
        draggable?: DatatableDraggable;
        resizable?: DatatableResizable;
        // ** Other
        debug?: boolean;
        nested?: boolean;
    }>(), //*
    {
        // ** Définition des données
        columns: null,
        rows: null,
        propId: "id",
        // ** Définition des données
        // ** Gestion des données
        loadingMessage: "Chargement en cours...", // '$vuetify.dataIterator.loadingText'
        noDataMessage: "Aucune données", // '$vuetify.noDataText'
        noResultsMessage: "Aucune données trouvées", // '$vuetify.dataIterator.noResultsText'
        // ** Interaction avec le tableau
        multiSort: false,
        // ** headers to footers
        hideHeader: false,
        displayFilters: false,
        pagination: false,
        displayFooter: false,
        // ** Design
        density: 'default',
        dividers: true,
        tableStyle: () => ({}),
        tableClass: () => Array<string>(),
        // ** Features
        // ** Other
    }
);
// console.log(`${props.identifiant}`, props)
// #endregion   ###     Props       ###

//#region       ###    Events       ###
const emit = defineEmits<{
    (e: "update:columns", value: DatatableColumn[]): void; // retourne l'ensemble des colonnes (en cas de modification avec draggable ou resizable)
    (e: "update:rows", value: DatatableRow[]): void; // retourne l'ensemble des rows (en cas de modification d'une données directement depuis le talbeau : ordre avec draggable, d'une valeur etc..)
    (e: "update:modelValue", value: DatatableRow[]): void; // retourne les rows affichées (incluant les interactions et la pagination etc)
    (e: "update:sorts", value: DatatableSort): void; // retourne les rows triées ou les paramètres de tries en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:group", value: DatatableGroup): void; // retourne les rows groupées ou les paramètres de groupage en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:filters", value: DatatableFilter): void; // retourne les rows filtrées ou les paramètres de filtres en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:select", value: DatatableSelection): void; // retourne les rows selectionnées ou les paramètres de selection en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:expand", value: DatatableExpansion): void; // retourne les rows selectionnées ou les paramètres de selection en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:pagination", value: DatatablePagination): void; // retourne la pagination
    (e: "dragged", value: any): void; // event dragged à remonter, la modification des lignes ou colonnes vont passer par les updates columns/rows
    (e: "resized", value: any): void; // event resized à remonter, la modification des lignes ou colonnes vont passer par les updates columns/rows
}>();
//#endregion    ###     Events       ###

//#region       ###     COLUMNS       ###
const columns = ref<Array<Partial<DatatableColumn>>>([]);
watch(
    () => props.columns, 
    () => {
        // console.info(`${props.identifiant} watch props.columns :`, props.columns)
        if (Array.isArray(props.columns)) {
            columns.value = cloneDeep(props.columns);
        } else {
            columns.value = [];
        }
    },
    { deep: true, immediate: true }
);

const getColumns = computed<DatatableColumn[]>(() => {
    // console.log(`====================================\n${props.identifiant} getColumns :`, columns.value);
    if (!columns.value) return [];
    let retour = [];

    for (let column of columns.value) {
        // console.log(new DatatableColumn(), column);
        let newColumn = merge(new DatatableColumn(), column);
        // merge(column, Object.preventExtensions(new DatatableColumn()), cloneDeep(column))
        if (newColumn.expansion && !("text" in newColumn.expansion))
            newColumn.expansion.text = (val: any) => val;
        if (!newColumn.id)
            newColumn.id =
                newColumn?.property?.replace(/[\W_]+/g, "_") ||
                Math.random().toString(36).substring(2, 13);
        retour.push(newColumn);
    }

    /* Log Columns
    console.groupCollapsed(`${props.identifiant} getColumns :`);
    console.table(columns.value )
    console.groupEnd(); //*/

    return retour;
    // return columns.value
});
//#endregion    ###     COLUMNS       ###

//#region       ###     ROWS       ###
let rows = ref<Array<Partial<DatatableRow>>>([]);

watch(
    () => props.rows, 
    () => {
        // console.info(`${props.identifiant} watch props.rows :`, props.rows)
        if (Array.isArray(props.rows)) {
            rows.value = cloneDeep(props.rows);
        } else {
            rows.value = [];
        }
    },
    { deep: true, immediate: true }
);

const getRows = computed(() => {
    if (!rows.value) return [];

    let retour: Partial<DatatableRow>[] = [...rows.value];

    // /***   Filtre les élements suivant la recherche
    // if (props.search)
    //     retour = retour.filter((r) => {
    //         let includeFilter = false;
    //         for (let col of getColumns.value) {
    //             if (col.filter) {
    //                 if (typeof col.filter === "function") {
    //                     includeFilter = col.filter(props.search, r[col.id]);
    //                 } else if (r[col.id]) {
    //                     includeFilter = `${r[col.id]}`.match(new RegExp(props.search, "i"));
    //                 }
    //                 if (includeFilter) return true;
    //             }
    //         }
    //         return false;
    //     }); // */

    // /***   Filtre les élements suivant les filtres
    retour = retour
        .filter((r) => Object
            .entries(filtering.value)
            .every(([col, filter]: [string, DatatableColumnFilter]) => filtersLabels[filter.method](r[col], filter.value))
        )
    // */

    // /***   Trie les élements dans l'ordre
    retour.sort((s1: Partial<DatatableRow>, s2: Partial<DatatableRow>) => {
        let sortResult = 0;
        for (let s of Object.keys(sorting.value)) {
            let r1 = s1[s],
                r2 = s2[s];
            let col = getColumns.value.find((c: DatatableColumn) => c.id === s);
            if (col) {
                if (typeof col.sort == "boolean") {
                    if (typeof r1 === "string" && typeof r2 === "string")
                        sortResult = r1.localeCompare(r2, "en", {
                            sensitivity: "base",
                            numeric: true,
                            usage: "sort",
                            ignorePunctuation: true,
                        });
                    else sortResult = r1 > r2 ? 1 : r1 < r2 ? -1 : 0;
                } else if (typeof col.sort == "function") {
                    sortResult = col.sort(r1, r2);
                }
            }
            if (sortResult === undefined)
                throw new Error(`Sort method ${col.sort} invalid for column ${col.id}`);
            if (sortResult == 0) continue;
            if (sorting.value[s].desc) sortResult *= -1;
            break;
        }
        return sortResult;
    }); // */

    /* Log Rows
      console.groupCollapsed(`${props.identifiant} getRows :`);
      console.table(retour)
      console.groupEnd(); //*/

    return retour;
});
//#endregion    ###     ROWS       ###

//#region       ###     CELLS       ###
function format(
    column: DatatableColumn,
    rowOrRows: DatatableRow | DatatableRow[],
    position: "body" | "header" | "footer" | "expansion" = "body"
) {
    let formating = column[position];
    // console.log(`${props.identifiant} format :`, column, position, column?.value?.[position])
    // if(position !== "body") console.log(`format ${props.identifiant} :`, position, column, formating, rowOrRows)
    if (typeof formating?.text !== "function") return formating?.text;
    // return "format ERROR"

    let data: any = (isRef(rowOrRows) && unref(rowOrRows)) || rowOrRows;

    let args = [];
    switch (position) {
        case "body":
        case "expansion":
            // if (position == "expansion")  console.log(column, rowOrRows, position, formating)
            // console.log(`${props.identifiant} format :`, position, data)
            args.push(data[formating?.property ?? column?.property]);
            args.push(data);
            break;
        default:
            // if (position == "footer")  console.log(column, rowOrRows, position, formating)
            // console.log(`${props.identifiant} format :`, position, rowOrRows )
            args.push(data.map?.((row: DatatableRow) => row[column?.property]));
            args.push(data);
    }

    // console.log(`${props.identifiant} format :`, column.id, position, args, formating?.text(...args))
    return formating?.text(...args);
}
//#endregion    ###     CELLS       ###

//#region       ###     FILTER      ###
const filtering = ref<DatatableFilter>({});

watch(() => props.filters, () => {
    // console.log(`${props.identifiant} watch filters`, props.filters)
    filtering.value = props.filters ? cloneDeep(props.filters) : {}
}, { deep: true, immediate: true })

function updateFilters(column: DatatableColumn, action: "value" | "method", value: any) {
    console.log(`${props.identifiant} updateFilters`, action, value, column)
    filtering.value[column.id][action] = value
}

const valueTypeByColumn = computed<{ [col: string]: string }>(() => {
    let retour = Object.fromEntries(getColumns.value.map(c => ([c.id, getCommonType(props.rows.map(r => r[c.property])) ]) ))
    console.log("valueTypeByColumn", retour)
    //getCommonType
    return retour
})

//#endregion    ###     FILTER      ###

//#region       ###     SORT     ###
const sorting = ref<DatatableSort>({});

function watchSortAndMultiSort() {
    if (!props.sorts) return;
    if (!props.multiSort) {
        const paires = Object.entries(props.sorts);
        if (paires.length) {
            const premier = paires[0];
            // console.log("watchSortAndMultiSort", paires, premier)
            sorting.value = { [premier[0]]: cloneDeep(premier[1]) } //props.sort.slice(0, 1);
        } else sorting.value = {}
    } else {
        sorting.value = cloneDeep(props.sorts)
        // let positions : number[] = []
        // sorting.value = Object.fromEntries(Object.entries(props.sort).map(([col, s], i) => {
        //     console.log(i, col, s, positions)
        //     let position = s.position
        //     if (position === undefined) position = i
        //     else if (position >= Object.keys(props.sort).length) position = i
        //     if (positions.includes(position)) 

        //     positions.push(position)
        //     return [col, {
        //         sorted: s.sorted,
        //         desc: s.desc,
        //         expansion: s.expansion,
        //         position
        //     } as DatatableColumnSort]
        // }))
    }
    // console.log("watchSortAndMultiSort", sorting.value)
}

watch(
    [() => props.sorts, () => props.multiSort],
    (
        [newSort, newMultiSort]: [DatatableSort, boolean],
        [oldSort, oldMultiSort]: [DatatableSort, boolean]
    ) => {
        // console.log(`${props.identifiant} watch sorts & multisort`, props.sorts, props.multiSort, [newSort, newMultiSort], [oldSort, oldMultiSort])
        watchSortAndMultiSort();
        if (oldMultiSort !== undefined && oldMultiSort !== newMultiSort) {
            emit("update:sorts", sorting);
        }
    },
    { deep: true, immediate: true }
);

function findColumnSort(column: DatatableColumn) {
    let found: null | DatatableColumnSort = null,
        position: number = 0;
    Object.entries(sorting.value)?.forEach(([key, col]: [string, DatatableColumnSort], i: number) => {
        if (key === column.id) {
            found = col;
            position = i;
            return;
        }
    });

    // console.log(`${this.identifiant} findColumnSort :`, found, position)
    if (!found) return;
    return { ...found, position: props.multiSort ? position + 1 : undefined };
}

function updateSorts(column: DatatableColumn, action: string) {
    // console.log(`${props.identifiant}`,"updateSorts", sorting.value, action, column)
    if (!sorting.value) return;

    if (action == "position") {
        let foundIndex = Object.keys(sorting.value).indexOf(column.id)
        // Si on souhaite changer la position de la colonne dans le sort

        // console.log(`${props.identifiant}`,"change position", foundIndex, Object.keys(sorting.value).length)
        
        let newOrder = Object.keys(sorting.value)
        newOrder.splice(
            (foundIndex + 1) % newOrder.length,
            0,
            newOrder.splice(foundIndex, 1)[0]
        );
        // console.log(Object.keys(sorting.value), newOrder)
        sorting.value = Object.fromEntries(newOrder.map(name => ([name, sorting.value[name]]) ))
    } else {
        let found = sorting.value[column.id];
        // Si on souhaite modifier l'utilisation de la colonne dans le sort
        // console.log(`${props.identifiant}`,"change sort", found)
        if (!found) {
            // Si La colonne n'est pas utilisée
            if (props.multiSort) {
                sorting.value[column.id] = { desc: false };
            } else {
                sorting.value = { [column.id]: { desc: false } };
            }
        } else {
            // Si la colonne est déjà utilisée dans le sort
            if (!found.desc) {
                found.desc = true; // Passer en mode descendant
            } else {
                delete sorting.value[column.id]; // Retirer la colonne du sort
            }
        }
    }

    // console.log(`${props.identifiant} updateSorts :`, sorting.value)
    emit("update:sorts", sorting.value);
}
//#endregion    ###     SORT    ###

//#region       ###     EXPANSE     ###
let expand = ref<string[]>([]);
let isExpanding = ref<boolean>(false);

watch(
    () => props.expand,
    () => {
        // console.log(`watch expanded ${props.identifiant} :`, props.expand)
        if (!props.expand) return;
        for (let [colId, rowsId] of Object.entries(props.expand)) {
            if (Array.isArray(rowsId))
                for (let rowId of rowsId) {
                    let id = `col-${colId}--row-${rowId}`;
                    if (!expand.value.includes(id)) expand.value.push(id);
                }
            else console.log(`watch expanded ${props.identifiant} :`, props.expand, rowsId);
        }
        // console.log(`watch expanded ${props.identifiant} :`, props.expand, expand.value)
    },
    { deep: true, immediate: true }
);

const getExpanded = computed(() => {
    let retour: { [id: string]: { [id: string]: boolean } } = {};
    for (let column of getColumns.value) {
        if (column?.expansion && column.id) {
            retour[column.id] = {};
            for (let row of getRows.value) {
                let id = `col-${column.id}--row-${getId(row)}`;
                // console.log(`${this.identifiant}`,retour, id)
                retour[column.id][getId(row)] = expand.value.includes(id);
            }
        }
    }
    // console.log(`getExpanded ${props.identifiant} : `,"retour", retour)
    return retour;
});

function hasExpansion(expanse) {
    let col = getColumns.value.find((col) => col.id == expanse);
    return col?.expansion?.columns;
}

function getExpandedValue(column, row) {
    // console.log(`${this.identifiant}`,"getExpandedValue", column?.id, row?.[this.whatPropId])
    if (row) return getExpanded.value?.[column.id]?.[this.getId(row)];
    if (!getExpanded.value?.[column.id]) return;
    let expandedRows = Object.values(getExpanded.value[column.id]).filter((r) => r);
    // console.log(`getExpandedValue ${this.identifiant}`, expandedRows, expandedRows.length, column?.id, Object.keys(this.getExpanded[column?.id]).length)
    return expandedRows.length == 0
        ? -1
        : expandedRows.length == Object.keys(getExpanded.value[column?.id]).length
            ? 1
            : 0;
}

async function expanse(fold, column, row) {
    let single = column.expansion.single ?? false;
    const timeouts = [];

    // console.log("retour avant",JSON.stringify(retour))
    isExpanding.value = true;
    // console.log("EXPANSE", isExpanding.value)
    if (row) {
        let id = `col-${column.id}--row-${getId(row)}`;
        if (fold) {
            let index = expand.value.findIndex((ex) => ex === id);
            if (index >= 0) expand.value.splice(index, 1);
        } else {
            if (single)
                expand.value = expand.value.filter(
                    (r) => !r.match(new RegExp(`col-${column.id}--row-.*`))
                );
            if (!expand.value.includes(id)) expand.value.push(id);
        }
    } else {
        // console.log("ALL", isExpanding.value)
        for (let row of getRows.value) {
            if (!isExpanding.value) break;
            let id = `col-${column.id}--row-${getId(row)}`;
            // console.log("id", id, isExpanding.value)
            if (fold) {
                let index = expand.value.findIndex((ex) => ex === id);
                if (index >= 0) expand.value.splice(index, 1);
            } else {
                if (!expand.value.includes(id))
                    timeouts.push(
                        new Promise((resolve) => {
                            setTimeout(() => {
                                if (!isExpanding.value) return;
                                expand.value.push(id);
                                resolve(id);
                            });
                        })
                    );
            }
        }
    }

    await Promise.all(timeouts);
    isExpanding.value = false;
    // console.log("EXPANSED", isExpanding.value)
    emitExpanded();
}

function emitExpanded() {
    let retour: { [id: string]: string[] } = {};
    for (let id of expand.value) {
        let [colId, rowId] = id.substring("col-".length).split("--row-");
        if (!retour[colId]) retour[colId] = new Array<string>();
        retour[colId].push(rowId);
    }
    // console.log(`emitExpanded ${props.identifiant} après :\n`, JSON.stringify(retour))
    emit("update:expand", retour);
}
//#endregion    ###     EXPANSE     ###

//#region       ###     SELECTION     ###
const selecting = ref<DatatableSelection>([]);

watch(
    () => props.select,
    () => {
        if (Array.isArray(props.select)) {
            selecting.value = selectIsOnlyOfStrings(props.select)
                ? cloneDeep(props.select)
                : props.select.map((selection) =>
                    Object.assign(new DatatableColumnSelection(), cloneDeep(selection))
                );
        } else {
            selecting.value = [];
        }
    },
    { deep: true, immediate: true }
);

function selectIsOnlyOfStrings(select: DatatableSelection): select is string[] {
    return select?.reduce(
        (isString: boolean, selection: DatatableColumnSelection | string) =>
            isString && typeof selection === "string",
        true
    );
}

function getSelect(column: DatatableColumn) {
    if (selectIsOnlyOfStrings(selecting.value)) {
        return selecting.value;
    } else {
        return selecting.value.find(
            (selection: DatatableColumnSelection) => selection.column === column.id
        )?.selected;
    }
}

function selectAll(column: DatatableColumn, event: Event) {
    // console.log(`${props.identifiant} selectAll`, column.id)
    let retour: DatatableSelection = cloneDeep(selecting.value);
    if (selectIsOnlyOfStrings(selecting.value)) {
        retour = (event.target as HTMLInputElement).checked
            ? getRows.value.map((row: Partial<DatatableRow>) => getId(row))
            : [];
    } else {
        let indexSelection = (selecting.value as Array<DatatableColumnSelection>)?.findIndex(
            (selection: DatatableColumnSelection) => selection.column === column.id
        );
        let selection: DatatableColumnSelection =
            indexSelection >= 0
                ? selecting.value[indexSelection]
                : Object.assign(new DatatableColumnSelection(), {
                    column: column.id,
                    selected: [],
                } as DatatableColumnSelection);
        selection.selected = (event.target as HTMLInputElement).checked
            ? getRows.value.map((row: Partial<DatatableRow>) => getId(row))
            : [];
        retour.splice(
            indexSelection >= 0 ? indexSelection : selecting.value.length,
            indexSelection >= 0 ? 1 : 0,
            selection
        );
    }
    // console.log(`${props.identifiant} selectAll`, column.id, retour)
    selecting.value = retour;
    emit("update:select", selecting.value);
}

function select(column: DatatableColumn, row: DatatableRow, event: Event) {
    console.log(`${props.identifiant} select`, column.id, getId(row), event);
    if (selectIsOnlyOfStrings(selecting.value)) {
        let index = selecting.value.indexOf(getId(row));
        if (index < 0) selecting.value.push(getId(row));
        // else selecting.value.splice(index, 1)
        else selecting.value = selecting.value.filter((s) => s !== getId(row));
    } else {
        let indexSelection = (selecting.value as Array<DatatableColumnSelection>)?.findIndex(
            (selection: DatatableColumnSelection) => selection.column === column.id
        );
        let selection: DatatableColumnSelection =
            indexSelection >= 0
                ? selecting.value[indexSelection]
                : Object.assign(new DatatableColumnSelection(), {
                    column: column.id,
                    selected: [],
                } as DatatableColumnSelection);
        if (!selection.selected) selection.selected = [];
        let index = selection.selected.indexOf(getId(row));
        if (index < 0) selection.selected.push(getId(row));
        // else selection.selected.splice(index, 1)
        else selection.selected = selection.selected.filter((s) => s !== getId(row));
        if (indexSelection < 0) selecting.value.push(selection);
    }
    emit("update:select", selecting.value);
}
//#endregion    ###     SELECTION     ###

//#region       ###     PAGINATION     ###

//#endregion    ###     PAGINATION     ###

//#region       ###     DESIGN      ###
function getSticky(
    position: "tfoot" | "thead" | DatatableColumn,
    zIndex: number | null = null
) {
    let retour: {
        position?: string
        bottom?: number | string
        top?: number | string
        right?: number | string
        left?: number | string
        zIndex?: number
    } = {}
    // console.log(`getSticky ${identifiant}`, position)
    if (position == "tfoot") {
        retour.position = props.stick?.footer ? "sticky" : "relative"
        if(props.stick?.footer) retour.bottom = "-1px"
        retour.zIndex = zIndex ?? 4
    } else if (position == "thead") {
        retour.position = props.stick?.header ? "sticky" : "relative"
        if(props.stick?.header) retour.top = 0
        retour.zIndex = zIndex ?? 5
    } else if (typeof position == "object" && position.sticky) {
        retour.position = "sticky"
        if (typeof position.sticky === "string") {
            retour[position.sticky] = 0
            retour.zIndex = zIndex ?? 1
        } else if (typeof position.sticky === "object") {
            if (position.sticky.position)
                retour[position.sticky.position] = position.sticky.distance ?? 0
            retour.zIndex = position.sticky.zIndex ?? 1
        }
    } else {
        retour.position = "relative"
    }
    return retour
}

function hasDivider(row: undefined | 'tbody' | 'thead' | 'tfoot' | DatatableRow, position: 'top' | 'bottom') {
    if(props.dividers === true) return true
    if(typeof props.dividers === "object" && props.dividers) {
        if (!row && props.dividers.header && props.dividers.body && props.dividers.footer) return true // Cas de la table

        if (typeof row === "string") {
            if(row === "thead" && props.dividers.header) return true
            if(row === "tfoot" && props.dividers.footer) return true
            if(row === "tbody" && props.dividers.body) return true
        } else if (typeof row === "object") {
            throw new Error("Not Implemented yet !")
        }
    }
    return false
}

const getRowHeightFromDensity = computed(() => {
    // { height typeof props.density === 'number' && (props.density+'px') || (typeof props.density === null && 'inherit')
    let retour = {}
    if (typeof props.density === 'number')  {
        retour["height"] = props.density+'px'
    } else if(props.density === null) {
        retour["height"] = 'inherit'
    }
    // console.log(`${props.identifiant} getRowHeightFromDensity`, retour, props.density)
    return retour
})

const table = ref()
const tableWrapper = ref()
console.log(table.value)
//#endregion    ###     DESIGN      ###

//#region       ###     GENERIC       ###
const whatPropId = computed(() => {
    if (typeof props.propId === "string") return props.propId
    else if (typeof props.propId === "object" && props.propId?.propId)
        return props.propId.propId
    else throw Error("Invalid row ID defined")
})

function getId(row: DatatableRow | Partial<DatatableRow>) {
    // console.log("getId", whatPropId.value, row[whatPropId.value])
    return (row[whatPropId.value] as string).replace(/[\W_]+/g, "_")
}

function generateKey(row: DatatableRow, column: DatatableColumn) {
    // console.log(`${props.identifiant} generateKey :`, row, column)
    // if(typeof row === "string")
    let id = typeof row === "string" ? row : getId(row)
    // if(typeof row !== "string") {
    //     console.log(`${this.identifiant}`,row, this.whatPropId, column)
    //     console.log(`${this.identifiant}`,"column id", column.id)
    // }
    // console.log(`${this.identifiant}`,"id", id)
    id = id.replace(" ", "_")
    // console.log(`${this.identifiant}`,`${id}-${column.id}`, row, this.whatPropId)
    return `${id}-${typeof column === "string" ? column : column.id}`
}
//#endregion    ###     GENERIC       ### */

//#region       ###     THIS       ###
const getThis = computed(() => {
    let retour = {
        // props
        ...props,
        // computed cols & rows
        headers: getColumns.value,
        displaying: getRows.value,
        // generic
        whatPropId,
        getId,
        generateKey,
        getSticky,
        hasDivider,
        getRowHeightFromDensity,
        // cells
        format,
        // sort
        // sorts: sorting.value, // sorting,
        sorting,
        findColumnSort,
        updateSorts,
        // filter
        // filters: filtering.value,// filtering,
        filtering,
        updateFilters,
        valueTypeByColumn,
        // expanse
        expand: expanse,
        getExpandedValue,
        // select
        select: selecting,
        selectAll,
        // design
        el: table,
        wrapper: tableWrapper,
    };
    // console.log(`${props.identifiant} getThis`, retour)
    return retour;
});
//#endregion    ###     THIS       ### */
</script>

<style lang="scss">
:root {
    --table-background-color-light: white;
    --table-background-color-light-active: #e1e1e1;
    --table-background-color-light-hover: #cccccc;
    --table-background-color-dark: #1e1e1e;
    --table-background-color-dark-active: #313131; // #444444; // #3c3c3c;
    --table-background-color-dark-hover: #444444; // #313131; // #2e2e2e;

    --table-text-color-light: black;
    --table-text-color-dark: white;
    --table-text-font-size: 0.9rem;

    --table-button-color-light: lightgray;
    --table-button-color-dark: gray;
    --table-button-hover-color-light: gray;
    --table-button-hover-color-dark: lightgray;

    --table-border-options: thin solid;
    --table-border-color-light: rgba(0, 0, 0, 0.12);
    --table-border-color-dark: hsla(0, 0%, 100%, 0.12);

    --table-expansion-shadow-light: rgb(50 50 50 / 50%);
    --table-expansion-shadow-dark: rgb(200 200 200 / 50%);
    --table-expansion-shadow-top: inset 0 4px 10px -8px;
    --table-expansion-shadow-bottom: inset 0 -4px 10px -8px;

    // --table-headers-background-color: rgb(246, 247, 250);
    // --table-odd-background-color: #e0e6ed26;
    // --table-even-background-color: #e0e6ed26;
}

.table-parent, .table-filter-menu {
    &::-webkit-scrollbar {
        width: 8px;
        height: 10px;
    }

    &::-webkit-scrollbar-track {
        // background: #f1f1f1;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        // background: #888;
        border-radius: 10px;
    }
}

table {
    border-radius: 4px;
    max-width: 100%;
    border-spacing: 0;

    // border-collapse: collapse;
    border-collapse: separate; // without, border on cells disappears with sticky

    th {
        font-weight: bold;
        text-align: initial;
    }

    th,
    td {
        font-size: var(--table-text-font-size);
        transition: padding 0.2s cubic-bezier(0.4, 0, 0.6, 1);
        padding: 6px 16px;
        // padding: 0 16px;
        height: 38px;

        box-sizing: border-box;

        .table-filter-input {
            height: 28px;
        }

        .table-filter-button > svg {
            width: 18px;
            height: 18px;
        }

        &.table-empty-row-cell {
            text-align: center;
            // color: rgba(0,0,0,.38);
        }

        &:not(.divider).table-selection {
            padding-right: 0;
        }

        .table-expansion {
            padding-right: 4px !important;
            // opacity: 0.5;
            pointer-events: auto;
            cursor: pointer;
            outline: 0;

            .table-expansion-icon {
                display: block;
                width: 16px;
                height: 16px;
                fill: currentColor;
            }
        }
    }

    &.density-compact {

        th,
        td {
            padding: 2px 16px;
            height: 26px;
        }

        .table-filter-input {
            height: 24px;
        }

        .table-filter-button > svg {
            width: 14px;
            height: 14px;
        }

        .table-filter-menu li {
            padding: 4px 20px;
        }

        .table-progress .table-progress-bar {
            height: 3px;
        }
    }

    &.density-comfortable {

        th,
        td {
            padding: 10px 16px;
            height: 62px;
        }

        .table-filter-input {
            height: 40px;
        }

        .table-filter-button > svg {
            width: 18px;
            height: 18px;
        }

        .table-filter-menu li {
            padding: 12px 20px;
        }

        .table-progress .table-progress-bar {
            height: 8px;
        }
    }

    .table-progress {

        // height: 4px;
        th,
        td {
            height: auto;
            padding: 0;
        }

        .table-progress-bar {
            height: 5px;
            position: relative;

            > div {
                position: absolute;
                border-radius: 10px;
                top: 0;
                right: 100%;
                bottom: 0;
                left: 0;
                width: 0;
                animation: progress_bar_loading 2s linear infinite;
            }
        }
    }

    thead,
    tfoot {

        tr:not(:last-child) {
            th,
            td {
                padding-bottom: 0px;
            }
        }

        tr:first-child:not(:last-child),
        tr:last-child:not(:first-child) {
            th, td {
                height: inherit;
            }
        }

        th,
        td {

            &.sortable .table-sort {
                pointer-events: auto;
                cursor: pointer;
                outline: 0;
            }

            &.sortable,
            &:not(.sortable) {
                &:not(.table-selection) {
                    .table-sort {
                        opacity: 0.2;
                        // color: green;
                    }
                }
            }

            &.sortable.active {
                .table-sort {
                    opacity: 0.6;
                    // color: red;
                }
            }

            &.sortable:not(.active) {
                .table-sort {
                    visibility: hidden;
                    // display: none;
                }

                &:hover {
                    .table-sort {
                        visibility: visible;
                        // display: initial;
                    }
                }
            }

            &.sortable:hover {
                .table-sort {
                    opacity: 1;
                    // color: blue;
                }
            }

            &.desc .table-sort-icon {
                transform: rotate(-180deg);
            }
        }

        .table-sort {
            display: flex;
            align-items: center;
        }

        .table-sort-icon {
            display: block;
            position: relative;
            top: -0.08rem;
            margin-left: 3px;
            fill: currentColor;
        }

        .table-sort-badge {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            border: 0;
            border-radius: 50%;
            min-width: 18px;
            min-height: 18px;
            height: 18px;
            width: 18px;
        }
    }

    thead {
        th, td {
            z-index: 3;
        }
    }
    tfoot {
        th, td {
            z-index: 2;
        }
    }

    tbody {
        .table-expansion-nested-row {

            >th,
            >td {
                padding: 0;
            }
        }
    }

    .table-filter {
        padding-left: 8px !important;
        padding-right: 8px !important;
        
        > div {
            width: 100%;
            max-width: 100%;
            display: flex;
            position: relative;
        }
    }

    .table-filter-input {
        // min-width: 60px;
        width: 100%;
        // flex: 1 0 auto;

        box-sizing: border-box;

        // border: 1px solid var(--table-border-color-light);
        border-right: 0 !important;
        border-radius: 4px 0 0 4px;

        outline: none;
    }

    .table-filter-button {

        // width: 100%;
        // flex: 0 0 auto;

        display: flex; 
        align-items: center; 
        justify-content: center;
        
        margin: 0;
        padding: 2px 6px;

        border-radius: 0 4px 4px 0;
        // border: 1px solid var(--table-border-color-light);
        background-color: buttonface;

        &:hover { 
            background-color: buttonface;

            > svg {
                color: black;
            }
        }

        > svg {
            color: grey;
        }
    }
    
    .table-filter-menu {
        position: absolute;
        right: 0;
        border-radius: 4px;
        opacity: 1;
        z-index: 10;

        overflow: auto;
        padding: 10px 0;

        ul {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }

        li {
            margin: 0;
            padding: 8px 20px;
            cursor: pointer;
        }
    }

    thead .table-filter-menu {
        top: calc(100% + 1px);
    }
    tfoot .table-filter-menu {
        bottom: calc(100% + 0px);
    }
}

.table-container-top {
    margin-bottom: 8px;
    width: 100%;

    .table-title {
        font-size: 1.8rem;
        margin-left: 12px;
    }
}

.table-container-bottom {
    margin-top: 8px;
    width: 100%;
}

.table-wrapper.theme--light {

    background-color: var(--table-background-color-light);
    color: var(--table-text-color-light);

    .table-parent, .table-filter-menu {
        &::-webkit-scrollbar-track {
            background: var(--table-background-color-light) ; // #f1f1f1;
        }

        &::-webkit-scrollbar-thumb {
            background: var(--table-background-color-light-active) ; // #888;
        }

        &::-webkit-scrollbar-thumb:hover {
            background: var(--table-background-color-light-hover) ; // #555;
        }
    }

    table {
        &.divider {
            thead>tr:last-child {

                >th,
                >td {
                    border-bottom: var(--table-border-options)  var(--table-border-color-light);
                    // border-bottom: 3px solid red;
                }
            }

            tfoot>tr:first-child {

                >th,
                >td {
                    border-top: var(--table-border-options)  var(--table-border-color-light);
                    // border-top: 3px solid green;
                }
            }

            tbody>tr:not(:last-child) {

                >th,
                >td {
                    border-bottom: var(--table-border-options)  var(--table-border-color-light);

                    &.table-empty-row-cell {
                        color: rgba(0, 0, 0, 0.38);
                    }
                }
            }
        }

        .table-progress .table-progress-bar {
            background: rgba(0, 0, 0, 0.12);

            >div {
                background: rgba(0, 0, 0, 0.25);
            }
        }

        .table-sort-badge {
            background-color: rgba(0, 0, 0, 0.12);
        }
   
        thead.divider>tr:last-child, 
        thead>tr.divider {
            >th,
            >td {
                border-bottom: var(--table-border-options)  var(--table-border-color-light);
            }
        }
        tfoot.divider>tr:first-child,
        tfoot>tr.divider {
            >th,
            >td {
                border-top: var(--table-border-options)  var(--table-border-color-light);
                // border-top: 3px solid green;
            }
        }
        tbody.divider>tr:not(:last-child), 
        tbody>tr.divider:not(:last-child) {
            >th,
            >td {
                border-bottom: var(--table-border-options)  var(--table-border-color-light);

                &.table-empty-row-cell {
                    color: rgba(0, 0, 0, 0.38);
                }
            }
        }

        th,
        td {
            background-color: var(--table-background-color-light);

            &.divider-left {
                border-left: var(--table-border-options)  var(--table-border-color-light);
            }

            &.divider-right {
                border-right: var(--table-border-options)  var(--table-border-color-light);
            }

            &.divider-top {
                border-top: var(--table-border-options)  var(--table-border-color-light);
            }

            &.divider-bottom {
                border-bottom: var(--table-border-options)  var(--table-border-color-light);
            }

        }
    
        .table-expansion-row, .table-expansion-nested-row {
            .table-expansion-only-row {
                box-shadow: 
                    var(--table-expansion-shadow-top) var(--table-expansion-shadow-light),
                    var(--table-expansion-shadow-bottom) var(--table-expansion-shadow-light);
            }

            .table-expansion-first-row {
                box-shadow: var(--table-expansion-shadow-top) var(--table-expansion-shadow-light);
            }

            .table-expansion-last-row {
                box-shadow: var(--table-expansion-shadow-bottom) var(--table-expansion-shadow-light);
            }
        }
    }

    .table-filter-input, .table-filter-button, .table-filter-menu { 
        border: 1px solid var(--table-border-color-light);
    }
    .table-filter-menu {
        background-color: var(--table-background-color-light);

        li.table-filter-active {
            background-color: var(--table-background-color-light-active);
        }
        li:hover {
            background-color: var(--table-background-color-light-hover);
        }
    }

    .table-expansion-icon, .table-sort-icon {
        fill: var(--table-text-color-light);
    }

}

.table-wrapper.theme--dark {
    background-color: var(--table-background-color-dark);
    color: var(--table-text-color-dark);

    .table-parent, .table-filter-menu {
        &::-webkit-scrollbar-track {
            background: var(--table-background-color-dark) ; 
        }

        &::-webkit-scrollbar-thumb {
            background: var(--table-background-color-dark-active) ; 
        }

        &::-webkit-scrollbar-thumb:hover {
            background: var(--table-background-color-dark-hover) ; 
        }
    }

    table {
        &.divider {
            thead>tr:last-child {

                >th,
                >td {
                    border-bottom: var(--table-border-options)  var(--table-border-color-dark);
                }
            }

            tfoot>tr:first-child {

                >th,
                >td {
                    border-top: var(--table-border-options)  var(--table-border-color-dark);
                }
            }

            tbody>tr:not(:last-child) {
                >th,
                >td {
                    border-bottom: var(--table-border-options)  var(--table-border-color-dark);

                    &.table-empty-row-cell {
                        color: rgba(255, 255, 255, 0.38);
                    }
                }
            }
        }

        .table-progress .table-progress-bar {
            background: hsla(0, 0%, 100%, 0.12);

            >div {
                background: hsla(0, 0%, 100%, 0.25);
            }
        }

        .table-sort-badge {
            background-color: hsla(0, 0%, 100%, 0.12);
        }
   
        thead.divider>tr, 
        thead>tr.divider {
            >th,
            >td {
                border-bottom: var(--table-border-options)  var(--table-border-color-dark);
                // border-bottom: 3px solid red;
            }
        }
        tfoot.divider>tr,
        tfoot>tr.divider {
            >th,
            >td {
                border-top: var(--table-border-options)  var(--table-border-color-dark);
                // border-top: 3px solid green;
            }
        }
        tbody.divider>tr:not(:last-child), 
        tbody>tr.divider:not(:last-child) {
            >th,
            >td {
                border-bottom: var(--table-border-options)  var(--table-border-color-dark);

                &.table-empty-row-cell {
                    color: rgba(0, 0, 0, 0.38);
                }
            }
        }

        th,
        td {
            background-color: var(--table-background-color-dark);

            &.divider-left {
                border-left: var(--table-border-options)  var(--table-border-color-dark);
            }

            &.divider-right {
                border-right: var(--table-border-options)  var(--table-border-color-dark);
            }

            &.divider-top {
                border-top: var(--table-border-options)  var(--table-border-color-dark);
            }

            &.divider-bottom {
                border-bottom: var(--table-border-options)  var(--table-border-color-dark);
            }

        }

        .table-expansion-row, .table-expansion-nested-row {
            .table-expansion-only-row {
                box-shadow: 
                    var(--table-expansion-shadow-top) var(--table-expansion-shadow-dark),
                    var(--table-expansion-shadow-bottom) var(--table-expansion-shadow-dark);
            }

            .table-expansion-first-row {
                box-shadow: var(--table-expansion-shadow-top) var(--table-expansion-shadow-dark);
            }

            .table-expansion-last-row {
                box-shadow: var(--table-expansion-shadow-bottom) var(--table-expansion-shadow-dark);
            }
        }

    }

    .table-filter-input, .table-filter-button, .table-filter-menu { 
        border: 1px solid var(--table-border-color-dark);
        // border: 1px solid var(--table-border-color-dark);
    }
    .table-filter-menu {
        background-color: var(--table-background-color-dark);

        li.table-filter-active {
            background-color: var(--table-background-color-dark-active);
        }
        li:hover {
            background-color: var(--table-background-color-dark-hover);
        }
    }

    .table-expansion-icon, .table-sort-icon {
        fill: var(--table-text-color-dark);
    }

}

@keyframes progress_bar_loading {
    0% {
        left: 0%;
        right: 100%;
        width: 0%;
    }

    10% {
        left: 0%;
        right: 75%;
        width: 25%;
    }

    90% {
        right: 0%;
        left: 75%;
        width: 25%;
    }

    100% {
        left: 100%;
        right: 0%;
        width: 0%;
    }
}
</style>
