# Vue 3 DataTable

This is a complete datatable component for vuejs.

**Examples** : [https://stackblitz.com/edit/vue3-bc-datatable-examples](https://stackblitz.com/edit/vue3-bc-datatable-examples)

## Use

### Installation

```bash
npm install vue3-bc-datatable
```

### Initialisation

Import component and derivatives as types :

```vue
import {
   Datatable, // component
   DatatableColumn, // type column
   DatatableRow,  // type row
   DatatableSort, // type sorted values
} from 'vue3-bc-datatable';
```

Import the css too :

```vue
import 'vue3-bc-datatable/dist/style.css';
```

## API

### Props

| prop | type | default | description |
|-------|------|---------|-------------|
| <td colspan=2 style="text-align: center; font-weight: bold; text-decoration: underline;">Identification</td>
| identifier | string | "" | to identify while debuging |
| title | sting | "" | A title above the table |
| <td colspan=2 style="text-align: center; font-weight: bold; text-decoration: underline;">Data</td>
| columns | Partial\<[DatatableColumn](src/components/types.ts#L27)>[] | [] | The columns of the table, configuration of features and design |
| rows | Partial\<[DatatableRow](src/components/types.ts#L100)>[] | [] | All the rows of the table (without filtering, sorting, pagination, ...) |
| propId | string | "id" | the property of a row to use as id for the row, must be valid |
| <td colspan=2 style="text-align: center; font-weight: bold; text-decoration: underline;">User experience</td>
| loading | boolean | false | display the loader section for user experience |
| loadingMessage | string | "Loading in progress... | The message display if no data but loading |
| noResultsMessage | string | "No results" | The message display if no data because of an interaction (filters) |
| noDataMessage | string | "No data" | The message display if no data |
| <td colspan=2 style="text-align: center; font-weight: bold; text-decoration: underline;">Manipulation</td>
| sorts | [DatatableSort](src/components/types.ts#L124) | undefined | The way to sort the rows to display |
| multiSort | boolean | false | Enable the multi column sort |
| filters | Function \| [DatatableFilter](src/components/types.ts#L144) | undefined | The way to filter the rows to display |
| expand | [DatatableExpansion](src/components/types.ts#L290) | undefined | The way to filter the rows to display |
| select | [DatatableSelection](src/components/types.ts#L302) | undefined | To check (checkbox) the rows in the selection |
| pagination | <td colspan=2 style="text-align: left;">*Not Implemented Yet !!*</td>
| <td colspan=2 style="text-align: center; font-weight: bold; text-decoration: underline;">Design</td>
| hideHeader | boolean | false | To remove the thead from the table |
| displayFooter | boolean | false | To dispaly the tfoot of the table |
| displayFilters | boolean | false | To display the row with inputs in header or footer for filtering |
| stick | DatatableSticky | undefined | to set sticky the header (thead) or footer (tfoot) |
| density | 'default' \| 'comfortable' \| 'compact' \| number \| null | 'default' | for the cell height and padding |
| dark | boolean | false | To set in a dark theme (see css variable to change colors) |
| dividers | DatatableDividers | false | To display border between rows (for cols see options in columns) |
| tableStyle | [StyleProps](src/components/types.ts#L10) | {} | vue props style to apply on table |
| tableClass | [ClassProps](src/components/types.ts#L11) | string[] | vue props class to apply on table |
| nested | boolean | false | Change a bit the design, used for the nested table |
| | | | |

#### Details **DatatableColumn**

#### Details **DatatableRow**

### Events

| event | data | description |
|-------|------|-------------|
| displaying | [DatatableRow](src/components/types.ts#L100)[] | The rows displayed, after sort, filters, ... |
| update:sorts | [DatatableSort](src/components/types.ts#L124) | The new way of sorting rows (after interaction with sort on columns) |
| update:filters | [DatatableFilter](src/components/types.ts#L144) | The new way of filtering rows (after interaction with filter input on columns) |
| update:select | [DatatableSelection](src/components/types.ts#L302) | The new selection of rows (after checking a selection checkbox) |
| update:expand | [DatatableExpansion](src/components/types.ts#L290) | The new expansions (after collpasing or expanding an expansion) |
| | | |

### Slots

| slot name | data | description |
|-----------|------|-------------|
| <td colspan=1 style="text-align: center; font-weight: bold; text-decoration: underline;">Wrapper</td>
| title | [getThis](src/components/datatable.vue#L999) | To customise the Title zone on top of the table wrapper |
| top | [getThis](src/components/datatable.vue#L999) | To customise the top zone (below title) of the table wrapper, useful to use a custom filters or any other features in the component |
| default | [getThis](src/components/datatable.vue#L999) | To replace the table component in the wrapper |
| pagination | [getThis](src/components/datatable.vue#L999) + ___ | To define your own pagination |
| bottom | [getThis](src/components/datatable.vue#L999) | To replace the table component in the wrapper |
| <td colspan=1 style="text-align: center; font-weight: bold; text-decoration: underline;">Table</td>
| header | [getThis](src/components/datatable.vue#L999) | To customize thead content |
| progress | loading + dark + density | To replace the default progress-bar when loading |
| body | [getThis](src/components/datatable.vue#L999) | To customize tbody content |
| no-data | filters + loading + columns + displaying + message | To set a custom content in the tr for message when no rows displayed |
| footer | [getThis](src/components/datatable.vue#L999) | To customize tfoot content |
| <td colspan=1 style="text-align: center; font-weight: bold; text-decoration: underline;">Header/Footer (datatable-headers)</td>
| header-tr |  | To set the content of the header tr |
| header-\<columnId> |  | To set the content of a specific cell (column) of the header tr (use th/td) |
| header-tr-filters |  | To set the content of the filters tr |
| header-\<columnId>-filter |  | To set the content of a cell (column) of the header tr |
| footer-tr |  | To set the content of the footer tr |
| footer-\<columnId> |  | To set the content of a specific cell (column) of the footer tr (use th/td) |
| footer-tr-filters |  | To set the content of the filters tr |
| footer-\<columnId>-filter |  | To set the content of a cell (column) of the footer tr |
| filters |  | To use a custom filters cell (use th/td) for every filters of the table |
| <td colspan=1 style="text-align: center; font-weight: bold; text-decoration: underline;">Content</td>
| row-<rowId> | | Content of a specfif row |
| rows | | Content of all rows |
| cell-<columnId>-row-<rowId> | | Content of a cell (specific column) for a specific row |
| cell-<columnId>-body | | Content of a cell (specific column) for all rows |
| <td colspan=1 style="text-align: center; font-weight: bold; text-decoration: underline;">Expansion</td>
| row-<rowId>-expansion-<expansion> | | Content of a specific expansion of a specific row |
| rows-expansion-<expansion> | | Content of a specific expansion of all rows |
| rows-expansions | | content of all expansions |
| | | |

[**getThis**](src/components/datatable.vue#L999) is a computed with all the props, computed, functions useful and the dom ref to the table.

### CSS

| var | default | description |
|-----|---------|-------------|
| --bcdatatable-title-font-size | 1.8rem | Font size of title |
| --bcdatatable-background-color-light | white | The main background-color in light mode |
| --bcdatatable-background-color-light-active | #e1e1e1 | The active for interaction element in light mode |
| --bcdatatable-background-color-light-hover | #cccccc | The hover for interaction element in light mode |
| --bcdatatable-background-color-dark | #1e1e1e | The main background-color in dark mode |
| --bcdatatable-background-color-dark-active | #313131 | The active for interaction element in dark mode |
| --bcdatatable-background-color-dark-hover | #444444 | The hover for interaction element in dark mode |
| --bcdatatable-text-color-light | black | Font color in light mode |
| --bcdatatable-text-color-dark | white | Font color in dark mode |
| --bcdatatable-text-font-size | 0.9rem | Font size of text content |
| --bcdatatable-button-color-light | lightgray | Button color in light mode |
| --bcdatatable-button-color-dark | gray | Button color in dark mode |
| --bcdatatable-button-hover-color-light | gray | Button hover color in light mode |
| --bcdatatable-button-hover-color-dark | lightgray | Button hover color in dark mode |
| --bcdatatable-border-options | thin solid | The border style or rows/columns |
| --bcdatatable-border-color-light | rgba(0, 0, 0, 0.12) | The border color in light mode |
| --bcdatatable-border-color-dark | hsla(0, 0%, 100%, 0.12) | The border color in dark mode |
| --bcdatatable-expansion-shadow-light | rgb(50 50 50 / 50%) | The shadow color of expansions in light mode |
| --bcdatatable-expansion-shadow-dark | rgb(200 200 200 / 50%) | The shadow color of expansions in dark mode |
| --bcdatatable-expansion-shadow-top | inset 0 4px 10px -8px | The shadow style for top of expansions |
| --bcdatatable-expansion-shadow-bottom | inset 0 -4px 10px -8px | The shadow style for bottom of expansions |

## Futur evolutions

* [ ] **Pagination** add a pagination feature  
* [ ] **Nested sort** sort in nested table  
* [ ] **Nested filter** filter in nested table  
* [ ] **Nested Slots** custom slots for expansions  
* [ ] **Group** rows by values for a column  
