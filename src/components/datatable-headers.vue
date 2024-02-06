<template>
    <component :is="component" :class="{ divider: table.hasDivider(component) }">
        <slot :name="slotPrefix" v-bind="table">
            <!-- <tr v-if="table.displayFilters && component === 'tfoot'">
                <slot :name="`${slotPrefix}-tr-filters`" v-bind="table">
                    <slot v-if="table" v-for="column in headers" :key="`filter-${table.generateKey(component, column)}`"
                        :name="`${slotPrefix}-${column.id}-filter`" 
                        v-bind="table"
                        :value="table.format(column, table.displaying, slotPrefix)"
                        :class="[column[`${slotPrefix}Class`], { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }]"
                        :style="{ ...column[`${slotPrefix}Style`], ...table.getSticky(column) }"
                    >
                        <template v-if="!column.hidden">
                            <th v-if="!column.filter"></th>
                            <th v-else-if="true"
                                :class="[ { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                                class="table-filter"
                            >
                                <div>

                                </div>
                            </th>
                        </template>
                    </slot>
                </slot>
            </tr> -->
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
            <!-- <tr v-if="table.displayFilters && component === 'thead'"> -->
            <tr v-if="table.displayFilters">
                <slot :name="`${slotPrefix}-tr-filters`" v-bind="table">
                    <slot v-if="table" v-for="column in headers" :key="`filter-${table.generateKey(component, column)}`"
                        :name="`${slotPrefix}-${column.id}-filter`" 
                        v-bind="table"
                        :value="table.format(column, table.displaying, slotPrefix)"
                        :class="[column[`${slotPrefix}Class`], { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }]"
                        :style="{ ...column[`${slotPrefix}Style`], ...table.getSticky(column), ...table.getRowHeightFromDensity.value }"
                    >
                        <template v-if="!column.hidden"> 
                            <th v-if="!column.filter"
                                :class="[ { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                                :style="{ ...table.getSticky(column), ...table.getRowHeightFromDensity.value,  }" 
                            >
                            </th>
                            <th v-else-if="true"
                                :class="[ { 'divider-left': column.dividerLeft, 'divider-right': column.dividerRight }, ]"
                                :style="{ ...table.getSticky(column), ...table.getRowHeightFromDensity.value,  }" 
                                class="table-filter"
                                @mouseleave="hideFiltersMenu(table.generateKey(component, column))"
                            >
                                <div>
                                    <input class="table-filter-input" >
                                    <button class="table-filter-button" @click="displayFiltersMenu(table.generateKey(component, column), column)">
                                        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                        </svg>
                                    </button>
                                    <div class="table-filter-menu" v-if="displayedFiltersMenu === table.generateKey(component, column)" >
                                        <ul>
                                            <li>No Filter</li>
                                            <li v-for="i in 5" @click="" class="" >Filtre {{ i }}</li>
                                        </ul>
                                    </div>
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
import { ref, computed, onMounted, watch } from 'vue';
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

const displayedFiltersMenu = ref<string>("")
function displayFiltersMenu(buttonName: string, column: any) {
    // console.log("displayFiltersMenu", buttonName, column)
    if(displayedFiltersMenu.value === buttonName) displayedFiltersMenu.value = ''
    else displayedFiltersMenu.value = buttonName
}
function hideFiltersMenu(buttonName: string) {
    // return
    // console.log("hideFiltersMenu", buttonName, displayedFiltersMenu.value)
    displayedFiltersMenu.value = ""
}
</script>
        
<style lang="scss">

</style>