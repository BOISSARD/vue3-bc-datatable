<template>
    <slot />
</template>

<script setup lang="ts">
import { onMounted, onUpdated } from 'vue'

const props = withDefaults(defineProps<{
    id?: string,
    debug?: boolean
}>(), {})

onMounted(() => {
    console.log(`${props.id} rendered`)
})
onUpdated(() => {
    console.log(`${props.id} re-rendered`)
})
</script>