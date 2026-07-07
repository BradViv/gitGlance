<script setup>
import { provide } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { ViewportKey } from '@/keys/viewport'

const viewport = useViewport()
// Share viewport width/state with all child components via inject.
provide(ViewportKey, viewport)
</script>

<template>
  <RouterView />
</template>