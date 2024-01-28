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

        <div style="overflow: auto; width: 100%" :style="tableStyle" :class="tableClass">
            <slot v-bind="getThis">

                <table 
                    style="table-layout: auto; min-width: 100%"
                    :style="tableStyle"
                    :class="{ 'density-comfortable': density === 'comfortable', 'density-compact': density === 'compact', divider: hasDivider(), ...tableClass }" 
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

                                <tr>
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

                                                    <slot :name="`cell-${column.id}`" 
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

                                                        <DatatableCell 
                                                            :id="generateKey(row, column)"
                                                            :value="format(column, row)" 
                                                            v-bind="column.body"
                                                            :class="[...column.columnClass, column.bodyClass, { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight, }, ]" 
                                                            :style="{ ...column.columnStyle, ...column.bodyStyle, ...getSticky(column), ...getRowHeightFromDensity }"
                                                            :selectable="!!column.selection"
                                                            :selected="getSelect(column)?.includes(getId(row))"
                                                            @update:selected="select(column, row, $event)"
                                                            :expandable="!!column.expansion"
                                                            :expanded="getExpandedValue(column, row)"
                                                            @update:expanded="expanse($event, column, row)"
                                                            :debug="debug" 
                                                        />
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
                                                    />
                                                </td>
                                                <DatatableCell v-else 
                                                    :id="generateKey(`expansion-${identifiant}_${expansion}-${getId(row)}`, column)"
                                                    :colspan="getColumns.length" 
                                                    :class="{ 'table-expansion-first-row': i == 0 && length > 1, 'table-expansion-last-row': i == length - 1 && length > 1, 'table-expansion-only-row': length == 1, }" 
                                                    :style="{ ...getSticky(column), ...getRowHeightFromDensity  }" 
                                                    :value="format(getColumns.find((col) => col.id == expansion), row, 'expansion')" 
                                                    :debug="debug" 
                                                />
                                            </slot>

                                        </slot>

                                    </slot>

                                </tr>

                            </template>

                            <template v-else>
                                <tr class="table-empty-row">
                                    <slot name="no-data" 
                                        :filter="filter" 
                                        :loading="loading" 
                                        :columns="getColumns"
                                        :displaying="getRows"
                                        :message="filter ? noResultsMessage : loading ? loadingMessage : noDataMessage"
                                    >
                                        <td :colspan="getColumns.length" class="table-empty-row-cell font-weight-medium">
                                            {{ filter ? noResultsMessage : loading ? loadingMessage : noDataMessage }}
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
        sort?: DatatableSort; // La manière dont est trié le tableau au départ
        multiSort?: boolean;
        group?: DatatableGroup; // La manière dont sont groupées les lignes du tableau par une colonne
        search?: string;
        filter?: DatatableFilter; // La manière dont sont filtrées les lignes du tableau
        expand?: DatatableExpansion; // La manière dont sont étendus les lignes de certaines colonnes
        select?: DatatableSelection; // la manière dont selectionner des lignes
        // ** headers to footers
        hideHeader?: boolean;
        displayFilters?: boolean;
        pagination?: DatatablePagination; //
        displayFooter?: boolean;
        stick?: DatatableSticky;
        // ** Design
        // dense?: boolean;
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
console.log(`${props.identifiant}`, props)
// #endregion   ###     Props       ###

//#region       ###    Events       ###
const emit = defineEmits<{
    (e: "update:columns", value: DatatableColumn[]): void; // retourne l'ensemble des colonnes (en cas de modification avec draggable ou resizable)
    (e: "update:rows", value: DatatableRow[]): void; // retourne l'ensemble des rows (en cas de modification d'une données directement depuis le talbeau : ordre avec draggable, d'une valeur etc..)
    (e: "update:modelValue", value: DatatableRow[]): void; // retourne les rows affichées (incluant les interactions et la pagination etc)
    (e: "update:sort", value: DatatableSort): void; // retourne les rows triées ou les paramètres de tries en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:group", value: DatatableGroup): void; // retourne les rows groupées ou les paramètres de groupage en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:filter", value: DatatableFilter): void; // retourne les rows filtrées ou les paramètres de filtres en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:select", value: DatatableSelection): void; // retourne les rows selectionnées ou les paramètres de selection en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:expand", value: DatatableExpansion): void; // retourne les rows selectionnées ou les paramètres de selection en cas d'interaction ?? ce qui revient au même (indirectement) ?
    (e: "update:pagination", value: DatatablePagination): void; // retourne la pagination
    (e: "dragged", value: any): void; // event dragged à remonter, la modification des lignes ou colonnes vont passer par les updates columns/rows
    (e: "resized", value: any): void; // event resized à remonter, la modification des lignes ou colonnes vont passer par les updates columns/rows
}>();
//#endregion    ###     Events       ###

//#region       ###     COLUMNS       ###
const columns = ref<DatatableColumn[]>([]);
watch(() => props.columns, () => {
        // console.info(`${props.identifiant} watch props.columns :`, props.columnss, isRef(props.columns), isReactive(props.columns))
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

watch(() => props.rows, () => {
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
    if (props.search)
        retour = retour.filter((r) => {
            let includeFilter = false;
            for (let col of getColumns.value) {
                if (col.filter) {
                    if (typeof col.filter === "function") {
                        includeFilter = col.filter(props.search, r[col.id]);
                    } else if (r[col.id]) {
                        includeFilter = `${r[col.id]}`.match(new RegExp(props.search, "i"));
                    }
                    if (includeFilter) return true;
                }
            }
            return false;
        }); // */

    // /***   Trie les élements dans l'ordre
    retour.sort((s1: Partial<DatatableRow>, s2: Partial<DatatableRow>) => {
        let sortResult = 0;
        // console.log(`${this.identifiant}`,this.sorting)
        for (let s of sorting.value) {
            let r1 = s1[s.column],
                r2 = s2[s.column];
            let col = getColumns.value.find((c: DatatableColumn) => c.id === s.column);
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
            if (s.desc) sortResult *= -1;
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

//#endregion    ###     FILTER      ###

//#region       ###     SORT     ###
const sorting = ref<DatatableSort>([]);

function watchSortAndMultiSort() {
    if (!props.sort) return;
    if (!props.multiSort) {
        sorting.value = props.sort.slice(0, 1);
    } else {
        sorting.value = props.sort.map((s) => Object.assign({}, s));
    }
}

watch(
    [() => props.sort, () => props.multiSort],
    (
        [newSort, newMultiSort]: [DatatableSort, boolean],
        [oldSort, oldMultiSort]: [DatatableSort, boolean]
    ) => {
        // console.log(`${props.identifiant} watch sort & multisort`, props.sort, props.multiSort, [newSort, newMultiSort], [oldSort, oldMultiSort])
        watchSortAndMultiSort();
        if (oldMultiSort !== undefined && oldMultiSort !== newMultiSort) {
            emit("update:sort", sorting);
        }
    },
    { deep: true, immediate: true }
);

function findColumnSort(column: DatatableColumn) {
    let found: null | DatatableColumnSort = null,
        position: number = 0;
    sorting.value?.forEach((col: DatatableColumnSort, i: number) => {
        if (col.column === column.id) {
            found = col;
            position = i;
            return;
        }
    });

    // console.log(`${this.identifiant} findColumnSort :`, found, position)
    if (!found) return;
    return { ...found, position: props.multiSort ? position + 1 : undefined };
}

function updateSort(column: DatatableColumn, action: string) {
    // console.log(`${this.identifiant}`,"updateSort", action, column)
    if (!sorting.value) return;
    let foundIndex = sorting.value.findIndex(
        (col: DatatableColumnSort) => col.column === column.id
    );
    if (foundIndex === undefined) return;

    if (action == "position") {
        // Si on souhaite changer la position de la colonne dans le sort
        // console.log(`${this.identifiant}`,"change position", foundIndex, this.sorting.length)
        sorting.value.splice(
            (foundIndex + 1) % sorting.value.length,
            0,
            sorting.value.splice(foundIndex, 1)[0]
        );
    } else {
        // Si on souhaite modifier l'utilisation de la colonne dans le sort
        // console.log(`${this.identifiant}`,"change sort", foundIndex)
        if (foundIndex < 0) {
            // Si La colonne n'est pas utilisée
            if (props.multiSort) sorting.value.push({ column: column.id, desc: false });
            else
                sorting.value.splice(0, sorting.value.length, { column: column.id, desc: false });
        } else {
            // Si la colonne est déjà utilisée dans le sort
            let found = sorting.value[foundIndex];
            if (!found.desc)
                sorting.value.splice(foundIndex, 1, Object.assign(found, { desc: true }));
            //found.desc = true // Et que le sens est ascendant alors on passe en descendant
            else sorting.value.splice(foundIndex, 1); // Sinon vu que le sens est descendant on retire la colonne du sort
        }
    }

    // console.log(`${this.identifiant} updateSort :`, sorting.value)
    emit("update:sort", sorting.value);
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
        position?: string;
        bottom?: number | string;
        top?: number | string;
        right?: number | string;
        left?: number | string;
        zIndex?: number;
    } = {};
    // console.log(`getSticky ${identifiant}`, position)
    if (position == "tfoot" && props.stick?.footer) {
        retour.position = "sticky";
        retour.bottom = 0; // "-1px"
        retour.zIndex = zIndex ?? 100;
    } else if (position == "thead" && props.stick?.header) {
        retour.position = "sticky";
        retour.top = 0;
        retour.zIndex = zIndex ?? 100;
    } else if (typeof position == "object" && position.sticky) {
        retour.position = "sticky";
        if (typeof position.sticky === "string") {
            retour[position.sticky] = 0;
            retour.zIndex = zIndex ?? 1;
        } else if (typeof position.sticky === "object") {
            if (position.sticky.position)
                retour[position.sticky.position] = position.sticky.distance ?? 0;
            retour.zIndex = position.sticky.zIndex ?? 1;
        }
    }
    return retour;
}

function hasDivider(row: undefined | 'tbody' | 'thead' | 'tfoot' | DatatableRow ) {
    console.log(`${props.identifiant} hasDivider`, props.dividers, row)
    if(props.dividers === true) return true
    if(typeof props.dividers === "object" && props.dividers) {
        if (!row && props.dividers.header && props.dividers.body && props.dividers.footer) return true // Cas de la table

        if (typeof row === "string") {
            if(row === "thead" && props.dividers.header) return true
            if(row === "tfoot" && props.dividers.footer) return true
            if(row === "tbody" && props.dividers.body) return true
        } else if (typeof row === "object") {

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
    console.log(`${props.identifiant} getRowHeightFromDensity`, retour, props.density)
    return retour
})

//#endregion    ###     DESIGN      ###

//#region       ###     GENERIC       ###
const whatPropId = computed(() => {
    if (typeof props.propId === "string") return props.propId;
    else if (typeof props.propId === "object" && props.propId?.propId)
        return props.propId.propId;
    else throw Error("Invalid row ID defined");
});

function getId(row: DatatableRow | Partial<DatatableRow>) {
    // console.log("getId", whatPropId.value, row[whatPropId.value])
    return (row[whatPropId.value] as string).replace(/[\W_]+/g, "_");
}

function generateKey(row: DatatableRow, column: DatatableColumn) {
    // console.log(`${props.identifiant} generateKey :`, row, column)
    // if(typeof row === "string")
    let id = typeof row === "string" ? row : getId(row);
    // if(typeof row !== "string") {
    //     console.log(`${this.identifiant}`,row, this.whatPropId, column)
    //     console.log(`${this.identifiant}`,"column id", column.id)
    // }
    // console.log(`${this.identifiant}`,"id", id)
    id = id.replace(" ", "_");
    // console.log(`${this.identifiant}`,`${id}-${column.id}`, row, this.whatPropId)
    return `${id}-${typeof column === "string" ? column : column.id}`;
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
        sort: sorting,
        findColumnSort,
        updateSort,
        // expanse
        expand: expanse,
        getExpandedValue,
        // select
        select: selecting,
        selectAll,
    };
    // console.log(`${props.identifiant} getThis`, retour)
    return retour;
});
//#endregion    ###     THIS       ### */
</script>

<style lang="scss">
:root {
    --table-border-options: thin solid;
    --table-border-color-light: rgba(0, 0, 0, 0.12);
    --table-border-color-dark: hsla(0, 0%, 100%, 0.12);
    --table-expansion-shadow-light: rgb(50 50 50 / 50%);
    --table-expansion-shadow-dark: rgb(200 200 200 / 50%);
    --table-expansion-shadow-top: inset 0 4px 10px -8px;
    --table-expansion-shadow-bottom: inset 0 -4px 10px -8px;
}

table {
    border-radius: 4px;
    max-width: 100%;
    border-spacing: 0;
    // border-collapse: collapse;
    border-collapse: separate;

    th {
        font-weight: bold;
        text-align: initial;
    }

    th,
    td {
        font-size: 0.8rem;
        transition: padding 0.2s cubic-bezier(0.4, 0, 0.6, 1);
        padding: 6px 16px;
        // padding: 0 16px;
        height: 38px;

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
            padding: 1px 16px;
            height: 26px;
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

            >div {
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
                    >* {
                        opacity: 0.7;
                    }
                }
            }

            &.sortable.active {
                >* {
                    opacity: 0.87;
                }

                .table-sort {
                    opacity: 0.8;
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
                >* {
                    opacity: 1;
                }
            }

            &.desc .table-sort-icon {
                transform: rotate(-180deg);
            }
        }

        .table-sort-icon {
            display: block;
            position: relative;
            top: -0.08rem;
            margin-left: 3px;
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

    tbody {
        .table-expansion-nested-row {

            >th,
            >td {
                padding: 0;
            }
        }
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
    table {
        &.divider {
            thead>tr:last-child {

                th,
                td {
                    border-bottom: var(--table-border-options)  var(--table-border-color-light);
                    // border-bottom: 3px solid red;
                }
            }

            tfoot>tr:first-child {

                th,
                td {
                    border-top: var(--table-border-options)  var(--table-border-color-light);
                    // border-top: 3px solid green;
                }
            }

            tbody>tr:not(:last-child) {

                th,
                td {
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
            th,
            td {
                border-bottom: var(--table-border-options)  var(--table-border-color-light);
            }
        }
        tfoot.divider>tr:first-child,
        tfoot>tr.divider {
            th,
            td {
                border-top: var(--table-border-options)  var(--table-border-color-light);
                // border-top: 3px solid green;
            }
        }
        tbody.divider>tr:not(:last-child), 
        tbody>tr.divider:not(:last-child) {
            th,
            td {
                border-bottom: var(--table-border-options)  var(--table-border-color-light);

                &.table-empty-row-cell {
                    color: rgba(0, 0, 0, 0.38);
                }
            }
        }

        th,
        td {
            background-color: white;

            &.divider-left {
                border-left: var(--table-border-options)  var(--table-border-color-light);
            }

            &.divider-right {
                border-right: var(--table-border-options)  var(--table-border-color-light);
            }
        }
    
        .table-expansion-row {
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
}

.table-wrapper.theme--dark {
    background-color: #1e1e1e;
    color: #fff;

    table {
        &.divider {
            thead>tr:last-child {

                th,
                td {
                    border-bottom: var(--table-border-options)  var(--table-border-color-dark);
                }
            }

            tfoot>tr:first-child {

                th,
                td {
                    border-top: var(--table-border-options)  var(--table-border-color-dark);
                }
            }

            tbody>tr:not(:last-child) {

                th,
                td {
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
            th,
            td {
                border-bottom: var(--table-border-options)  var(--table-border-color-dark);
                // border-bottom: 3px solid red;
            }
        }
        tfoot.divider>tr,
        tfoot>tr.divider {
            th,
            td {
                border-top: var(--table-border-options)  var(--table-border-color-dark);
                // border-top: 3px solid green;
            }
        }
        tbody.divider>tr:not(:last-child), 
        tbody>tr.divider:not(:last-child) {
            th,
            td {
                border-bottom: var(--table-border-options)  var(--table-border-color-dark);

                &.table-empty-row-cell {
                    color: rgba(0, 0, 0, 0.38);
                }
            }
        }

        th,
        td {
            background-color: #1e1e1e;

            &.divider-left {
                border-left: var(--table-border-options)  var(--table-border-color-dark);
            }

            &.divider-right {
                border-right: var(--table-border-options)  var(--table-border-color-dark);
            }
        }

        .table-expansion-row {
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
