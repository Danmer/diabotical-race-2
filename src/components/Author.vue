<template>
  <a class="top-0 bottom-0 z-10 flex items-start justify-between w-full p-2 cursor-pointer row hover:bg-gray-900" :class="{ 'opacity-25': author.faded, 'active sticky': author.active }" :href="`?authors=${author.name}`" @click.exact.prevent="changeAuthorFilter(author.id)" @click.ctrl.prevent="toggleAuthorFilter(author.id)">
    <div class="flex-1 mr-2">
      <i class="mr-1 text-gray-500 fa fa-user" />
      {{ author.name }}
    </div>
    <div class="w-10 ml-2" :title="`${author.maps.size.toString()} maps`">
      <i class="mr-1 text-gray-500 fa fa-image" />
      {{ prettyNumber(author.maps.size) }}
    </div>
    <div class="w-10 ml-2" :title="`${author.players.size.toString()} players`">
      <i class="text-gray-500 fa fa-user" />
      {{ prettyNumber(author.players.size) }}
    </div>
    <div class="w-10 ml-2" :title="`${author.runs.size.toString()} runs`">
      <i class="text-gray-500 fa fa-running" />
      {{ prettyNumber(author.runs.size) }}
    </div>
  </a>
</template>

<script setup lang="ts">
  import { PropType } from 'vue'
  import { changeAuthorFilter, toggleAuthorFilter } from '../store/filter'
  import { prettyNumber } from '../utils'

  defineProps({
    author: {
      type: Object as PropType<TAuthor>,
      required: true,
    },
  })
</script>
