<template>
    <component :is="component" :class="{ divider: table.hasDivider(component) }">
        <slot :name="slotPrefix" v-bind="table">
            <tr>
                <slot :name="`${slotPrefix}-tr`" v-bind="table">
                    <slot v-if="table" v-for="column in headers" :key="table.generateKey(component, column)"
                        :name="`${slotPrefix}-${column.id}`" v-bind="table"
                        :value="table.format(column, table.displaying, slotPrefix)"
                        :class="[column[`${slotPrefix}Class`], { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }]"
                        :style="{ ...column[`${slotPrefix}Style`], ...table.getSticky(column) }"
                    > 
                        <DatatableCell v-if="!column.hidden"
                            header 
                        
                            :id="table.generateKey(component, column)"

                            :value="table.format(column, displaying, slotPrefix)"
                            v-bind="column[slotPrefix]"

                            :class="[...column.columnClass, column[`${slotPrefix}Class`], { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                            :style="{...column.columnStyle, ...column[`${slotPrefix}Style`], ...table.getSticky(column), ...table.getRowHeightFromDensity.value,  }" 
                            
                            :debug="table.debug"

                            :sortable="!!column.sort" 
                            :sorted="table.findColumnSort(column)"
                            @update:sorted="table.updateSort(column, $event)"

                            :selectable="column.selection && column.selection.global && !column.selection.single"
                            :selected="select && displaying && select.length == displaying.length"
                            @update:selected="table.selectAll(column, $event)"

                            :expandable="column.expansion?.global && !column.expansion?.single"
                            :expanded="table.getExpandedValue(column)" @update:expanded="table.expand($event, column)"
                        >
                        </DatatableCell>
                    </slot>
                </slot>
            </tr>
            <tr v-if="table.displayFilters && component === 'thead'">
                <slot :name="`${slotPrefix}-tr-filters`" v-bind="table">
                    <slot v-if="table" v-for="column in headers" :key="table.generateKey(component, column)"
                        :name="`${slotPrefix}-${column.id}-filter`" 
                        v-bind="table"
                        :value="table.format(column, table.displaying, slotPrefix)"
                        :class="[column[`${slotPrefix}Class`], { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }]"
                        :style="{ ...column[`${slotPrefix}Style`], ...table.getSticky(column) }"
                    >
                        <template v-if="!column.hidden"> 
                            <th v-if="column.filter == false"></th>
                            <th v-else-if="true"
                                :class="[ { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                                class="table-filter"
                            >
                                <!-- :class="[...column.columnClass, column[`${slotPrefix}Class`], { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                                :style="{...column.columnStyle, ...column[`${slotPrefix}Style`], ...table.getSticky(column), ...table.getRowHeightFromDensity.value,  }"  -->
                                <div>
                                    <input class="table-filter-input" >
                                    <button class="table-filter-button" >
                                        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                        </svg>
                                    </button>
                                </div>
                            </th>
                        </template>
                    </slot>
                </slot>
            </tr>
        </slot>
        <RerenderChecker v-if="table.debug" :id="table.generateKey(component, 'tr')" ></RerenderChecker>
    </component>
</template>
        
<script setup lang='ts'>
import { computed, onMounted, watch } from 'vue';
import DatatableCell from "./datatable-cell.vue"
import { DatatableColumn, DatatableRow, DatatableSelection } from './types';
import RerenderChecker from "./rerender-checker.vue"

const props = defineProps<{
    is?: "head" | "foot",
    identifiant?: string,

    table?: any,

    headers?: null | Partial<DatatableColumn>[], // Definition des colonnes
    displaying?: null | Partial<DatatableRow>[], // les Données du tableau

    select?: DatatableSelection,
}>()

const emit = defineEmits<{
    (e: 'selectedAll', value: any): void
    (e: 'expand', value: any): void
}>()

const component = computed(() => {
    return props.is === "head" ? "thead" : props.is === "foot" ? "tfoot" : "div"
})
const slotPrefix = computed(() => {
    return props.is === "head" ? "header" : props.is === "foot" ? "footer" : "unknown"
})

// console.groupCollapsed(`${component.value.toUpperCase()} ${props.identifiant} :`)
// console.table(props.table, ["value"])
// console.groupEnd()

// #region  ###     GENERIC       ###
if(props.debug) {
    onMounted(() => {
        console.log("onMounted headers", component.value, props.identifiant)
    })
    watch(props.identifiant, () => {
        console.log("watch headers", component.value, props.identifiant)
    }, { immediate: true, deep: true })
}
// #endregion  ###     GENERIC       ###
</script>
        
<style></style>