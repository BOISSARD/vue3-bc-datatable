<template>
    <component :is="component" 
        :class="[{ 
            'sortable': sortable && displaySort, 
            'active': sorted, 
            'asc': typeof sorted === 'object' && sorted?.desc, 
            'desc': typeof sorted === 'object' && sorted?.desc, 
            'groupable': groupable && displayGroup 
        }]"    
    >
        <div :style="{ display: 'flex', alignItems: align, justifyContent: justify }">
            <div v-if="expandable && displayExpanse"
                :style="{ flex: '0 0 auto' }"
                class="table-expansion"
            >
                <svg v-if="typeof expanded === 'number' ? expanded >= 0 : expanded" 
                    @click="$emit('update:expanded', true)"
                    xmlns="http://www.w3.org/2000/svg" viewBox="4 4 16 16" role="img" aria-hidden="true" class="table-expansion-icon" style="transform: rotate(-180deg);">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path>
                </svg>
                <svg v-if="typeof expanded === 'number' ? expanded <= 0 : !expanded" 
                    @click="$emit('update:expanded', false)"
                    xmlns="http://www.w3.org/2000/svg" viewBox="4 4 16 16" role="img" aria-hidden="true" class="table-expansion-icon">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path>
                </svg>
            </div>
            <div v-if="selectable && displaySelect" cols="auto">
                <!-- class="table-selection"
                :class="[{ 'table-cell-divider-left': column.dividerLeft,  'table-cell-divider-right': column.dividerRight }]" -->
                <input type="checkbox" :checked="selected" @change="emit('update:selected', $event )" >                    
            </div>
            <div :cols="cols">
                <slot>
                    <v-row no-gutters :align="align" :justify="justify">
                        <div v-if="prefix" cols="auto" class="mr-2">{{ prefix }}</div>
                        <div :cols="cols">{{ value }}</div>
                        <div v-if="suffix" cols="auto" class="ml-2">{{ suffix }}</div>
                    </v-row>
                </slot>
            </div>
            <div v-if="sortable && displaySort" 
                cols="auto" 
                @click.stop="$emit('update:sorted', 'sort')" 
                class="table-sort"
            >
                <span 
                    class="v-icon notranslate table-sort-icon" 
                    style="font-size: 18px; height: 18px; width: 18px;"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg" style="font-size: 18px; height: 18px; width: 18px;">
                        <path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"></path>
                    </svg>
                </span><span v-if="typeof sorted === 'object' && sorted?.position" 
                    @click.stop="$emit('update:sorted', 'position')"
                    class="table-sort-badge"
                >{{ sorted?.position}}</span>
            </div>
        </div>
        <client-only>
            <span v-show="debug" class="text-caption">{{ debugTime() }}</span>
        </client-only>
    </component>
</template>

<script setup lang="ts">
// #region Imports
import { computed } from 'vue'
import { DatatableCell, DatatableColumnCellOptions } from './types'
import useDebug from "../composables/useDebug"
// #endregion Imports

// #region  ###     Props       ###
const props = withDefaults(defineProps<{
    value?: DatatableCell
    
    header?: boolean
    debug?: boolean,

    text?: DatatableColumnCellOptions["text"]
    prefix?: string,
    suffix?: string,

    cols?: string,
    align?: string,
    justify?: string,
    
    sortable?: boolean,
    sorted?: boolean | { desc: boolean, position: string|number,  }
    displaySort?: boolean

    selectable?: boolean,
    selected?: boolean,
    displaySelect?: boolean

    groupable?: boolean,
    grouped?: boolean | object
    displayGroup?: boolean
    
    expandable?: boolean,
    expanded?: boolean | object | number
    displayExpanse?: boolean
}>() //*
, {
    value: "",
    align: "center",
    justify: "space-between",
    displayExpanse: true,
    displaySelect: true,
}) //*/
// console.log("props", JSON.stringify(props))
// #endregion   ###   Props    ###

// #region  ###     Events       ###
const emit = defineEmits<{
    (e: 'update:sorted', value: any ) : void
    (e: 'update:expanded', value: any ) : void
    (e: 'update:selected', value: any ) : void
}>()
// #endregion  ###     Events       ###

// #region  ###     COMPONENT       ###
const component = computed(() => props.header ? 'th' : 'td')
// #endregion  ###    COMPONENT     ###

// #region  ###     GENERIC       ###
const { debugTime } = useDebug()
// #endregion  ###     GENERIC       ###

</script>