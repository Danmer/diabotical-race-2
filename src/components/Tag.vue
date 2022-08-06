<template>
  <a class="top-0 bottom-0 z-10 flex items-start justify-between w-full p-2 cursor-pointer row hover:bg-gray-900" :class="{ 'opacity-25': tag.faded, 'active sticky': tag.active }" :href="`?tags=${tag.name}`" @click.exact.prevent="changeTagFilter(tag.id)" @click.ctrl.prevent="toggleTagFilter(tag.id)">
    <div class="flex-1">
      <i class="mr-1 text-gray-500 fa fa-fw" :class="`fa-${tag.icon || 'tag'}`" :style="{ color: tag.color }" />
      {{ tag.name }}
    </div>
    <div class="w-10 ml-4" :title="`${tag.maps.size.toString()} maps`">
      <i class="text-gray-500 fa fa-image" />
      {{ prettyNumber(tag.maps.size) }}
    </div>
    <div class="w-10 ml-2" :title="`${tag.players.size.toString()} players`">
      <i class="text-gray-500 fa fa-user" />
      {{ prettyNumber(tag.players.size) }}
    </div>
    <div class="w-10 ml-2" :title="`${tag.records.size.toString()} runs`">
      <i class="text-gray-500 fa fa-running" />
      {{ prettyNumber(tag.records.size) }}
    </div>
  </a>
</template>

<script setup lang="ts">
  import { PropType } from 'vue'
  import { changeTagFilter, toggleTagFilter } from '../store/filter'
  import { prettyNumber } from '../utils'

  defineProps({
    tag: {
      type: Object as PropType<TTag>,
      required: true,
    },
  })
</script>
