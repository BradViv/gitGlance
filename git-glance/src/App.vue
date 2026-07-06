<script setup>
import { provide } from 'vue'
import { useViewport } from '@/composables/useViewport'
import { ViewportKey } from '@/keys/viewport'

const viewport = useViewport()
provide(ViewportKey, viewport)
</script>

<template>
  <RouterView />
</template>