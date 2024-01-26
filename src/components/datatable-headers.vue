<template>
    <component :is="component">
        <slot :name="slotPrefix" v-bind="table">
            <tr>
                <slot :name="`${slotPrefix}-tr`" v-bind="table">
                    <template v-if="table" >
                    <slot v-for="column in headers" :key="table.generateKey(component, column)"
                        :name="`${slotPrefix}-${column.id}`" v-bind="table"
                        :value="table.format(column, table.displaying, slotPrefix)"
                        :class="[column[`${slotPrefix}Class`], { 'table-cell-divider-left': column.dividerLeft, 'table-cell-divider-right': column.dividerRight }]"
                        :style="{ ...column[`${slotPrefix}Style`], ...table.getSticky(column) }"
                    >
                        <DatatableCell 
                            header 
                        
                            :value="table.format(column, displaying, slotPrefix)"
                            v-bind="column[slotPrefix]"

                            :class="[column[`${slotPrefix}Class`], { 'table-cell-divider-left': column.dividerLeft, 'table-cell-divider-right': column.dividerRight }]"
                            :style="{ ...column[`${slotPrefix}Style`], ...table.getSticky(column) }" 
                            
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
                    </template>
                </slot>
            </tr>
        </slot>
    </component>
</template>
        
<script setup lang='ts'>
import { computed } from '@vue/reactivity';
import DatatableCell from "./datatable-cell.vue"
import { DatatableColumn, DatatableRow, DatatableSelection } from './types';

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

console.groupCollapsed(`${component.value.toUpperCase()} ${props.identifiant} :`)
console.table(props.table, ["value"])
console.groupEnd()
</script>
        
<style></style>