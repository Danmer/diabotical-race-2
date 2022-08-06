<template>
  <div class="flex-shrink-0 bg-center bg-cover rounded-sm thumbnail" :title="`${map.name} (${map.id})`" :style="{ backgroundImage: `url(https://quakelife.ru/diabotical/maps/img/thumbnails-sm/${map.id}.webp)` }"></div>
</template>

<script setup lang="ts">
  import { PropType } from 'vue'
  defineProps({
    map: {
      type: Object as PropType<TMap>,
      required: true,
    },
  })
</script>

<style>
  .april-1 .thumbnail {
    transform: rotate(180deg);
  }
</style>
