import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useViewport() {
  const width = ref(window.innerWidth)

  function update() {
    width.value = window.innerWidth
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  const isMobile = computed(() => width.value < 800)
  const isDesktop = computed(() => width.value >= 800)

  return { width, isMobile, isDesktop }
}