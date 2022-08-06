<template>
  <div class="relative flex items-center w-full p-2 leading-5 bg-left bg-cover row" :class="{ 'cursor-pointer': map.approved }" :style="style" @click="map.approved ? addMapFilter(map.name) : null">
    <UiThumbnail class="w-16 mr-1 -my-1 h-9" :map="map" />
    <div class="flex items-center flex-1 mr-4 -my-1 overflow-hidden">
      <div v-if="map.approved">
        <div class="truncate" :title="map.name">{{ map.name }}</div>
        <div class="mr-1 text-sm text-gray-400 truncate" :title="`by ${authors}`">by {{ authors }}</div>
      </div>
      <div v-else class="text-gray-400">Approving</div>
    </div>
    <div class="text-sm text-gray-400" :title="map.physicsIds.join(', ')">[{{ physicsLetters }}]</div>
    <i v-if="token" class="p-1 ml-1 -m-1 text-xs text-gray-500 cursor-pointer fa fa-edit hover:text-gray-300" @click.prevent.stop="modalMap.open(map)" />
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType } from 'vue'
  import { addMapFilter } from '../store/filter'
  import { config } from '../store/config'
  import { token } from '../store/storage'
  import { modalMap } from '../store/ui'

  const props = defineProps({
    map: {
      type: Object as PropType<TMap>,
      required: true,
    },
  })

  const style = computed(() => (config.runThumbnails ? { backgroundImage: `url(${props.map.image})`, backgroundBlendMode: 'soft-light' } : {}))
  const authors = computed(() => props.map.authorNames.join(', '))
  const physicsLetters = computed(() => props.map.physicsIds.map((physicsId) => physicsId.substring(0, 1)).join(', '))
</script>
