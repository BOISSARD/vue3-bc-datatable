<template>
    <slot />
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, watch } from 'vue'

const props = withDefaults(defineProps<{
    id?: string,
    debug?: boolean
}>(), {})

onMounted(() => {
    console.log("Mounted RC :", props.id)
})
onUpdated(() => {
    console.log("Updated RC :", props.id)
})
</script>