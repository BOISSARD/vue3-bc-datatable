<template>
    <component :is="component" :class="{ divider: table.hasDivider(component) }">
        <slot :name="slotPrefix" v-bind="table">

            <tr>
                <slot :name="`${slotPrefix}-tr`" v-bind="table">

                    <slot v-if="table" 
                        v-for="column in headers" 
                        :name="`${slotPrefix}-${column.id}`" v-bind="table"
                        :key="table.generateKey(component, column)"
                        :value="table.format(column, table.displaying, slotPrefix)"
                        :class="[column[`${slotPrefix}Class`], { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }]"
                        :style="{ ...column[`${slotPrefix}Style`], ...table.getSticky(component, column) }"
                    >

                        <DatatableCell v-show="!column.hidden"
                            header 
                        
                            :id="table.generateKey(component, column)"

                            :value="table.format(column, displaying, slotPrefix)"
                            v-bind="column[slotPrefix]"

                            :class="[...column.columnClass, column[`${slotPrefix}Class`], { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                            :style="{...column.columnStyle as object, ...column[`${slotPrefix}Style`], ...table.getSticky(component, column), ...table.getRowHeightFromDensity.value,  }" 
                            
                            :debug="table.debug"

                            :sortable="!!column.sort" 
                            :sorted="table.findColumnSort(column)"
                            @update:sorted="table.updateSorts(column, $event)"

                            :selectable="column.selection && column.selection.global && !column.selection.single"
                            :selected="select && displaying && select.length == displaying.length"
                            @update:selected="table.selectAll(column, $event)"

                            :expandable="column.expansion?.global && !column.expansion?.single"
                            :expanded="table.getExpandedValue(column)" @update:expanded="table.expand($event, column)"
                        >
                                <!-- {{ table.getSticky(component, column) }} -->
                        </DatatableCell>

                    </slot>

                </slot>
            </tr>

            <!-- <tr v-if="table.displayFilters && component === 'thead'"> -->
            <tr v-if="table.displayFilters">

                <slot :name="`${slotPrefix}-tr-filters`" v-bind="table">

                    <slot v-for="column in headers" 
                        :key="`filter-${table.generateKey(component, column)}`"
                        :name="`${slotPrefix}-${column.id}-filter`" 
                        v-bind="table"    
                        :value="table.filtering.value[column.id]?.value" 
                        :updateValue="value => table.updateFilters(column, 'value', value)"
                        :filterChoices="table.getFilters(table.valueTypeByColumn.value[column.id])"
                        :chooseFilter="choice => table.updateFilters(column, 'method', choice)"
                        :class="['bcdatatable-filter', { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                        :style="{ ...table.getRowHeightFromDensity.value, ...table.getSticky(component, column) }" 
                        :filterMenuHeight="filterMenuHeight"
                    >

                        <slot :key="`filter-${table.generateKey(component, column)}`"
                            :name="`filters`" 
                            v-bind="table"
                            :value="table.filtering.value[column.id]?.value" 
                            :updateValue="value => table.updateFilters(column, 'value', value)"
                            :filterChoices="table.getFilters(table.valueTypeByColumn.value[column.id])"
                            :chooseFilter="choice => table.updateFilters(column, 'method', choice)"
                            :class="['bcdatatable-filter', { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                            :style="{ ...table.getRowHeightFromDensity.value, ...table.getSticky(component, column) }"
                            :filterMenuHeight="filterMenuHeight"
                        >

                            <th v-if="column.filter" v-show="!column.hidden"
                                :class="[ { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                                :style="{ ...table.getRowHeightFromDensity.value, ...table.getSticky(component, column) }" 
                                class="bcdatatable-filter"
                                @mouseleave="hideFiltersMenu()"
                            >
                                <div>
                                    <input class="bcdatatable-filter-input" :value="table.filtering.value[column.id]?.value" @input="table.updateFilters(column, 'value', ($event.target as any).value)" >
                                    <button class="bcdatatable-filter-button" @click="displayFiltersMenu(table.generateKey(component, column))">
                                        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                        </svg>
                                    </button>
                                    <div class="bcdatatable-filter-menu" v-if="displayedFiltersMenu === table.generateKey(component, column)" style="" :style="{ 'max-height': filterMenuHeight+'px' }" >
                                            <ul>
                                            <li v-for="(method, label) in table.getFilters(table.valueTypeByColumn.value[column.id])" 
                                                @click="table.updateFilters(column, 'method', {label, method})" 
                                                :class="[ { 'bcdatatable-filter-active': table.filtering.value[column.id]?.method === label } ]" 
                                            >{{ label }}</li>
                                        </ul>
                                    </div>
                                </div>
                            </th>
                            <th v-else v-show="!column.hidden"
                                :class="[ { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                                :style="{ ...table.getSticky(component, column), ...table.getRowHeightFromDensity.value,  }" 
                            >
                            </th>

                        </slot>
                    </slot>
                </slot>
            </tr>
        </slot>
        <RerenderChecker v-if="table.debug" :id="table.generateKey(component, 'tr')" ></RerenderChecker>
    </component>
</template>
        
<script setup lang='ts'>
import { ref, computed, onMounted, watch } from 'vue';
import DatatableCell from "./datatable-cell.vue"
import { DatatableColumn, DatatableRow, DatatableSelection } from './types';
import RerenderChecker from "./rerender-checker.vue"

const props = defineProps<{
    is?: "head" | "foot",
    identifier?: string,

    table?: any,

    headers?: null | Partial<DatatableColumn>[], // Definition des colonnes
    displaying?: null | Partial<DatatableRow>[], // les Données du tableau

    select?: DatatableSelection,
    
    debug?: boolean,
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


// #region  ###     GENERIC       ###
if(props.debug) {
    onMounted(() => {
        console.log("onMounted headers", component.value, props.identifier)
    })
    watch(() => props.identifier, () => {
        console.log("watch headers", component.value, props.identifier)
    }, { immediate: true, deep: true })
}
// #endregion  ###     GENERIC       ###

const displayedFiltersMenu = ref<string>("")
function displayFiltersMenu(buttonName: string) {
    if(displayedFiltersMenu.value === buttonName) displayedFiltersMenu.value = ''
    else displayedFiltersMenu.value = buttonName
}
function hideFiltersMenu() {
    displayedFiltersMenu.value = ""
}


const filterMenuHeight = computed(() => {
    const table = props.table.el.value
    const headHeight = table?.querySelector('thead')?.getBoundingClientRect().height ?? 0
    const footHeight = table?.querySelector('tfoot')?.getBoundingClientRect().height ?? 0
    const menuHeight = (props.table.wrapper.value?.clientHeight - headHeight - footHeight) * (!footHeight || !headHeight ? 0.75 : 1)
    // console.log("filterMenuHeight", table, props.table.el.value?.querySelector('thead'), headHeight, props.table.el.value?.querySelector('tfoot'), footHeight, menuHeight)
    return menuHeight
})
</script>
        
<style lang="scss">

</style>