<template>
  <div class="w-64 h-64 bg-gray-500">
    <div ref="container" class="h-full overflow-y-scroll">
      <div class="content">
        <div v-for="i of count" class="p-3 odd:bg-gray-600">{{ i }}</div>
        <div ref="last" style="height: 1px"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useIntersectionObserver } from '@vueuse/core'

  const wrapper = ref()
  const container = ref()
  const content = ref()
  const last = ref()

  const count = ref(5)

  onMounted(() => {
    useIntersectionObserver(last.value, onIntersect, { root: container.value, threshold: [0, 1] })
  })

  function onIntersect([entry]: IntersectionObserverEntry[]) {
    console.log('1')
    if (entry.isIntersecting) {
      console.log('next')
      count.value += 5
    }
  }
</script>
