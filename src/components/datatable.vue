<template>
    <div style="max-width: 100%" :class="{
        'theme--light': !dark,
        'theme--dark': dark,
        'pa-4 bcdatatable-wrapper': !nested,
    }">
        <div v-if="$slots.title || title" class="bcdatatable-container-top">
            <slot name="title" v-bind="getThis"><span class="bcdatatable-title">{{ title }}</span></slot>
        </div>
        <div v-if="$slots.top" class="bcdatatable-container-top">
            <slot name="top" v-bind="getThis"></slot>
        </div>

        <div style="overflow: auto; width: 100%" :style="tableStyle" :class="tableClass" class="bcdatatable-parent" ref="tableWrapper" >
            <slot v-bind="getThis">

                <table 
                    style="bcdatatable-layout: auto; min-width: 100%"
                    :style="tableStyle"
                    :class="{ 
                        'density-comfortable': density === 'comfortable', 
                        'density-compact': density === 'compact', 
                        divider: hasDivider(), 
                        ...tableClass as object
                    }" 
                    ref="table"
                >

                    <DatatableHeaders v-if="!hideHeader" 
                        is="head" 
                        :identifier="identifier"
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
                        <tr class="bcdatatable-progress" :style="{ ...getSticky('thead') as object }">
                            <td :colspan="getColumns.length">
                                <slot name="progress" :loading="loading" :dark="dark" :density="density">
                                    <div class="bcdatatable-progress-bar">
                                        <div />
                                    </div>
                                </slot>
                            </td>
                        </tr>
                    </template>

                    <tbody :class="{ divider: hasDivider('tbody') }">

                        <slot name="body" v-bind="getThis">

                            <template v-if="getRows.length" v-for="row in getRows" :key="getId(row)">

                                <tr :style="{ ...getSticky(row) as object, ...row.style as object }" :class="[ ...(row.class ?? []) ]">
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
                                                    :expanded="getExpandedValue(column, row)" 
                                                    :value="format(column, row)"
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

                                                        <DatatableCell v-show="!column.hidden"
                                                            :id="generateKey(row, column)"
                                                            :value="format(column, row)" 
                                                            v-bind="column.body"
                                                            :class="[...column.columnClass, column.bodyClass, { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight, 'divider-top': row.dividerTop, 'divider-bottom': row.dividerBottom }, ]" 
                                                            :style="{ ...column.columnStyle as object, ...column.bodyStyle as object, ...getSticky(row, column), ...getRowHeightFromDensity }"
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
                                        .map(([key, val]) => val[getId(row)] ? { expansion: key, column: getColumns.find((col) => col.id == key), row: val, length: undefined } : null)
                                        .filter((kv) => !!kv)
                                        .map((kv, _, arr) => { kv.length = arr.length; return kv; })
                                    " 
                                    :key="`${getId(row)}-expansion-${expansion}`" 
                                    :class="[{ 'bcdatatable-expansion-row': !hasExpansion(expansion), 'bcdatatable-expansion-nested-row': hasExpansion(expansion), }]"
                                    :style="{ ...getSticky(row) as object }"
                                >

                                    <slot :name="`row-${getId(row)}-expansion-${expansion}`" 
                                        :row="row" :whatPropId="whatPropId" 
                                        :expanse="expanse" :displaying="getRows" 
                                        :column="column" :columns="getColumns" 
                                        :value="format(getColumns.find((col) => col.id == expansion), row, 'expansion')" >

                                        <slot :name="`rows-expansion-${expansion}`" 
                                            :row="row" :whatPropId="whatPropId"
                                            :expanse="expanse" :displaying="getRows" 
                                            :column="column" :columns="getColumns" 
                                            :value="format(getColumns.find((col) => col.id == expansion), row, 'expansion')" >

                                            <slot :name="`rows-expansions`" 
                                                :row="row" :whatPropId="whatPropId"
                                                :expanse="expanse" :displaying="getRows" 
                                                :column="column" :columns="getColumns"
                                                :value="format(getColumns.find((col) => col.id == expansion), row, 'expansion')" >

                                                <td v-if="hasExpansion(expansion)" 
                                                    :colspan="getColumns.length" 
                                                    :class="{ 'bcdatatable-expansion-first-row': i == 0 && length > 1, 'bcdatatable-expansion-last-row': i == length - 1 && length > 1, 'bcdatatable-expansion-only-row': length == 1, }" 
                                                    :style="{ ...getSticky(row, column) as object }"
                                                >
                                                    <RerenderChecker v-if="debug" :id="generateKey(`${identifier}_${expansion}-${getId(row)}`,'bcdatatable-nested')" ></RerenderChecker>
                                                    <Datatable 
                                                        nested 
                                                        class="bcdatatable-nested"
                                                        :identifier="`${identifier}_${expansion}-${getId(row)}`"
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
                                                    :id="generateKey(`expansion-${identifier}_${expansion}-${getId(row)}`, column)"
                                                    :colspan="getColumns.length" 
                                                    :class="[
                                                        { 'bcdatatable-expansion-first-row': i == 0 && length > 1, 'bcdatatable-expansion-last-row': i == length - 1 && length > 1, 'bcdatatable-expansion-only-row': length == 1, }, 
                                                        ...(row.class ?? [])
                                                    ]" 
                                                    :style="{ ...getSticky(row, column), ...getRowHeightFromDensity, }" 
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
                                <tr class="bcdatatable-empty-row">
                                    <slot name="no-data" 
                                        :filters="filtering" 
                                        :loading="loading" 
                                        :columns="getColumns"
                                        :displaying="getRows"
                                        :message="filtering ? noResultsMessage : loading ? loadingMessage : noDataMessage"
                                    >
                                        <td :colspan="getColumns.length" class="bcdatatable-empty-row-cell font-weight-medium">
                                            {{ filters ? noResultsMessage : loading ? loadingMessage : noDataMessage }}
                                            <RerenderChecker v-if="debug" :id="generateKey(`${identifier}`,'messages')" />
                                        </td>
                                    </slot>
                                </tr>
                            </template>
                        </slot>
                    </tbody>

                    <DatatableHeaders v-if="displayFooter" 
                        is="foot" 
                        :identifier="identifier"
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

        <div v-if="$slots.pagination" class="bcdatatable-container-bottom">
            <slot name="pagination" v-bind="getThis"></slot>
        </div>
        <div v-if="$slots.bottom" class="bcdatatable-container-bottom">
            <slot name="bottom" v-bind="getThis"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
//#region   Imports
import { computed, ref, watch, isRef, unref } from "vue";
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
    filtersLabelsForTypes,
    defaultFilterForType,
    DatatableFilterLabel,
DatatableColumnSelection
} from ".";
import RerenderChecker from "./rerender-checker.vue"
// #endregion

//#region       ###    Props       ###
const props = withDefaults(
    defineProps<{
        // ** Identification
        identifier?: string;
        title?: string;
        // ** Définition des données
        columns?: Partial<DatatableColumn>[]; // Definition des colonnes
        rows?: Partial<DatatableRow>[]; // les Données du tableau
        propId?: DatatablePropertyId; // Colonne dont la valeur sert d'id
        // ** Gestion des données
        loading?: boolean; // Loading pour informer de la modification des données
        loadingMessage?: string; // Message lors du chargement des données (si aucune données à afficher)
        noResultsMessage?: string; // Message si aucune données suite à une interaction (filter)
        noDataMessage?: string; // Message si aucune données à la fin du chargement
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
        columns: () => [],
        rows: () => [],
        propId: "id",
        // ** Définition des données
        // ** Gestion des données
        loadingMessage: "Loading in progress...", // '$vuetify.dataIterator.loadingText'
        noResultsMessage: "No results", // '$vuetify.dataIterator.noResultsText'
        noDataMessage: "No data", // '$vuetify.noDataText'
        // ** Interaction avec le tableau
        multiSort: false,
        // ** headers to footers
        hideHeader: false,
        displayFilters: false,
        pagination: false,
        displayFooter: false,
        // ** Design
        density: 'default',
        // dividers: () => ({ header: true,  }),
        tableStyle: () => ({}),
        tableClass: () => Array<string>(),
        // ** Features
        // ** Other
    }
);
// #endregion   ###     Props       ###

//#region       ###    Events       ###
const emit = defineEmits<{
    (e: "displaying", value: DatatableRow[]): void; // retourne l'ensemble des colonnes (en cas de modification avec draggable ou resizable)
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
        // console.info(`${props.identifier} watch props.columns :`, props.columns)
        if (Array.isArray(props.columns)) {
            columns.value = cloneDeep(props.columns);
        } else {
            columns.value = [];
        }
    },
    { deep: true, immediate: true }
);

const getColumns = computed<DatatableColumn[]>(() => {
    // console.log(`====================================\n${props.identifier} getColumns :`, columns.value);
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
    console.groupCollapsed(`${props.identifier} getColumns :`);
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
        // console.info(`${props.identifier} watch props.rows :`, props.rows)
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

    // /***   Filtre les élements suivant les filtres
    retour = retour
        .filter((r) => { 
            // console.log("==================", r.name, "\n", r)
            let retour = Object
            .entries(filtering.value)
            .every(([col, filter]: [string, DatatableColumnFilter]) => {
                // console.log(col, filter, filtersLabels[filter.method], filter.value, filtersLabels[filter.method]?.(r[col], filter.value), filtersLabels[filter.method]?.(r[col], filter.value) ?? true)
                return filtersLabels[filter.method]?.(r[col], filter.value) ?? true
            })
            // console.log(r.name, ":", retour)
            return retour
        })
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
      console.groupCollapsed(`${props.identifier} getRows :`);
      console.table(retour)
      console.groupEnd(); //*/

    emit("displaying", retour)
    return retour;
});
//#endregion    ###     ROWS       ###

//#region       ###     CELLS       ###
function format(
    column: Partial<DatatableColumn>,
    rowOrRows: Partial<DatatableRow> | Partial<DatatableRow>[],
    position: "body" | "header" | "footer" | "expansion" = "body"
) {
    let formating = column[position];
    // console.log(`${props.identifier} format :`, column, position, formating)
    // if(position !== "body") console.log(`format ${props.identifier} :`, position, column, formating, rowOrRows)
    if (typeof formating?.text !== "function") return formating?.text;
    // return "format ERROR"

    let data: any = (isRef(rowOrRows) && unref(rowOrRows)) || rowOrRows;

    let args = [];
    switch (position) {
        case "body":
        case "expansion":
            // if (position == "expansion")  console.log(column, rowOrRows, position, formating)
            // console.log(`${props.identifier} format :`, position, data)
            args.push(data[(formating as any)?.property ?? column?.property]);
            args.push(data);
            break;
        default:
            // if (position == "footer")  console.log(column, rowOrRows, position, formating)
            // console.log(`${props.identifier} format :`, position, rowOrRows )
            args.push(data.map?.((row: DatatableRow) => row[column?.property]));
            args.push(data);
    }

    // console.log(`${props.identifier} format :`, column.id, position, args, formating?.text(...args))
    return formating?.text(...args);
}
//#endregion    ###     CELLS       ###

//#region       ###     FILTER      ###
const valueTypeByColumn = computed<{ [col: string]: any }>(() => Object.fromEntries(getColumns.value.map(c => ([c.id, getCommonType( props.rows.map(r => r[c.property]) ) ]) )) )

const filtering = ref<DatatableFilter>({});

watch(() => props.filters, () => {
    // console.log(`${props.identifier} watch filters`, props.filters)
    // filtering.value = props.filters ? cloneDeep(props.filters) : {}
    let filters = props.filters ? cloneDeep(props.filters) : {}
    for(let col of getColumns.value) {
        if (col.filter && filters[col.id] == undefined) {
            // console.log(col.id, getDefault(valueTypeByColumn.value[col.id]) )
            filters[col.id] = { value: null, method: getDefault(valueTypeByColumn.value[col.id]) }
        }
    }
    filtering.value = filters
}, { deep: true, immediate: true })

function getFilters(type) {
    // console.log("getFilters", type, filtersLabelsForTypes[type].map(label => [label, filtersLabels[label]]) )
    return Object.fromEntries(filtersLabelsForTypes[type].map(label => [label, filtersLabels[label]]))
}
function getDefault(type): DatatableFilterLabel {
    // console.log("getDefault", type, defaultFilterForType[type], defaultFilterForType[type] ?? "No filter")
    return defaultFilterForType[type] ?? "No filter"
}

function updateFilters(column: DatatableColumn, action: "value" | "method", value: any) {
    if (action === "value") {
        filtering.value[column.id][action] = value
    } else if (action === "method") {
        filtering.value[column.id][action] = value.label
    }
    emit("update:filters", filtering.value);
}
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
        [_, newMultiSort]: [DatatableSort, boolean],
        [__, oldMultiSort]: [DatatableSort, boolean]
    ) => {
        // console.log(`${props.identifier} watch sorts & multisort`, props.sorts, props.multiSort, [newSort, newMultiSort], [oldSort, oldMultiSort])
        watchSortAndMultiSort();
        if (oldMultiSort !== undefined && oldMultiSort !== newMultiSort) {
            emit("update:sorts", sorting.value);
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

    // console.log(`${this.identifier} findColumnSort :`, found, position)
    if (!found) return;
    return { ...found, position: props.multiSort ? position + 1 : undefined };
}

function updateSorts(column: DatatableColumn, action: string) {
    // console.log(`${props.identifier}`,"updateSorts", sorting.value, action, column)
    if (!sorting.value) return;

    if (action == "position") {
        let foundIndex = Object.keys(sorting.value).indexOf(column.id)
        // Si on souhaite changer la position de la colonne dans le sort

        // console.log(`${props.identifier}`,"change position", foundIndex, Object.keys(sorting.value).length)
        
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
        // console.log(`${props.identifier}`,"change sort", found)
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

    // console.log(`${props.identifier} updateSorts :`, sorting.value)
    emit("update:sorts", sorting.value);
}
//#endregion    ###     SORT    ###

//#region       ###     EXPANSE     ###
let expand = ref<string[]>([]);
let isExpanding = ref<boolean>(false);

watch(
    () => props.expand,
    () => {
        // console.log(`watch expanded ${props.identifier} :`, props.expand)
        if (!props.expand) return;
        for (let [colId, rowsId] of Object.entries(props.expand)) {
            if (Array.isArray(rowsId))
                for (let rowId of rowsId) {
                    let id = `col-${colId}--row-${rowId}`;
                    if (!expand.value.includes(id)) expand.value.push(id);
                }
            else console.log(`watch expanded ${props.identifier} :`, props.expand, rowsId);
        }
        // console.log(`watch expanded ${props.identifier} :`, props.expand, expand.value)
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
                // console.log(`${this.identifier}`,retour, id)
                retour[column.id][getId(row)] = expand.value.includes(id);
            }
        }
    }
    // console.log(`getExpanded ${props.identifier} : `,"retour", retour)
    return retour;
});

function hasExpansion(expanse) {
    let col = getColumns.value.find((col) => col.id == expanse);
    return col?.expansion?.columns;
}

function getExpandedValue(column, row) {
    // console.log(`${this.identifier}`,"getExpandedValue", column?.id, row?.[this.whatPropId])
    if (row) return getExpanded.value?.[column.id]?.[getId(row)];
    if (!getExpanded.value?.[column.id]) return;
    let expandedRows = Object.values(getExpanded.value[column.id]).filter((r) => r);
    // console.log(`getExpandedValue ${this.identifier}`, expandedRows, expandedRows.length, column?.id, Object.keys(this.getExpanded[column?.id]).length)
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
    // console.log(`emitExpanded ${props.identifier} après :\n`, JSON.stringify(retour))
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
    // console.log(`${props.identifier} selectAll`, column.id)
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
    // console.log(`${props.identifier} selectAll`, column.id, retour)
    selecting.value = retour;
    emit("update:select", selecting.value);
}

function select(column: Partial<DatatableColumn>, row: Partial<DatatableRow>, event: Event) {
    console.log(`${props.identifier} select`, column.id, getId(row), event);
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
    position: "tfoot" | "thead" | Partial<DatatableRow>,
    column?: Partial<DatatableColumn>,
    zIndex?: number
) {
    let retour: {
        position?: string
        top?: number | string
        bottom?: number | string
        left?: number | string
        right?: number | string
        zIndex?: number
    } = {}
    // By default :
    retour.position = "relative"

    if (column && column.sticky) {
        retour.position = "sticky"
        retour.zIndex = zIndex ?? (position == "thead" || position == "tfoot") ? 6 : 3

        if (typeof column.sticky === "object" && column.sticky?.position) {
            retour[column.sticky.position] = column.sticky.distance ?? 0
            if (typeof column.sticky.zIndex === "number") retour.zIndex = column.sticky.zIndex
         }else if (typeof column === "object" && typeof column.sticky === "string") {
            retour[column.sticky] = 0
        }
    } else {
        retour.position = "sticky"
        retour.zIndex = zIndex ?? (position == "thead" || position == "tfoot") ? 5 : 2

        if (typeof position === "object" && typeof position.sticky === "object" && position.sticky?.position) {
            retour[position.sticky.position] = position.sticky.distance ?? 0
            if (typeof position.sticky.zIndex === "number") retour.zIndex = position.sticky.zIndex
        } else if (typeof position === "object" && typeof position.sticky === "string") {
            retour[position.sticky] = 0
        }
        else if (position == "tfoot" &&  props.stick?.footer) retour.bottom = "-1px"
        else if (position == "thead" &&  props.stick?.header) retour.top = 0
    }

    // console.log(`getSticky ${props.identifier}`, position?.name ?? position, column?.id, retour)
    return retour
}

function hasDivider(row?: 'tbody' | 'thead' | 'tfoot' | DatatableRow) { // , position: 'top' | 'bottom'
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
    // console.log(`${props.identifier} getRowHeightFromDensity`, retour, props.density)
    return retour
})

const table = ref()
const tableWrapper = ref()
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

function generateKey(row: string | Partial<DatatableRow>, column: string | Partial<DatatableColumn>) {
    // console.log(`${props.identifier} generateKey :`, row, column)
    // if(typeof row === "string")
    let id = typeof row === "string" ? row : getId(row)
    // if(typeof row !== "string") {
    //     console.log(`${this.identifier}`,row, this.whatPropId, column)
    //     console.log(`${this.identifier}`,"column id", column.id)
    // }
    // console.log(`${this.identifier}`,"id", id)
    id = id.replace(" ", "_")
    // console.log(`${this.identifier}`,`${id}-${column.id}`, row, this.whatPropId)
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
        getFilters,
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
    // console.log(`${props.identifier} getThis`, retour)
    return retour;
});
//#endregion    ###     THIS       ### */
</script>
