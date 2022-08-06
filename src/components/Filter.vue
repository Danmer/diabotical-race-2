<template>
  <div v-if="selectedAuthors.length || selectedTags.length || selectedPlayer || filter.dayId !== lastDay" class="flex items-center w-full p-2 bg-[#124]">
    <div>Filter:</div>

    <!-- Day -->
    <div v-if="filter.dayId && filter.dayId !== lastDay" class="flex items-center px-2 py-1 ml-2 -my-1 text-xs text-white bg-blue-800 rounded shadow">
      <i class="mr-1 fa fa-calendar text-2xs opacity-30" />
      {{ prettyDate(filter.dayId) }}
      <i class="p-1 ml-1 -m-1 opacity-50 cursor-pointer fa fa-arrow-left text-2xs hover:opacity-100" title="Previous day" @click="prevDay()" />
      <i class="p-1 ml-1 -m-1 opacity-50 cursor-pointer fa fa-arrow-right text-2xs hover:opacity-100" title="Next day" @click="nextDay()" />
      <i class="p-1 ml-1 -m-1 opacity-50 cursor-pointer fa fa-times text-2xs hover:opacity-100" @click="filter.dayId = lastDay" />
    </div>

    <!-- Player -->
    <div v-if="selectedPlayer" class="flex items-center px-2 py-1 ml-2 -my-1 text-xs text-white rounded shadow" :class="filter.playerOpposite ? 'bg-red-800' : 'bg-blue-800'">
      <UiPlayer :player="selectedPlayer" />
      <i class="ml-2 opacity-50 cursor-pointer fa fa-sort text-2xs hover:opacity-100" title="Invert filter" @click="filter.playerOpposite = !filter.playerOpposite" />
      <i class="p-1 ml-1 -m-1 opacity-50 cursor-pointer fa fa-times text-2xs hover:opacity-100" @click="filter.playerId = ''" />
    </div>

    <!-- Authors -->
    <div class="flex items-center px-2 py-1 ml-2 -my-1 text-xs text-white bg-blue-800 rounded shadow" v-for="author in selectedAuthors" :key="author.id">
      <i class="mr-1 fa fa-user text-2xs opacity-30" />
      {{ author.name }}
      <i class="p-1 ml-1 -m-1 opacity-50 cursor-pointer fa fa-times text-2xs hover:opacity-100" @click="removeAuthorFilter(author.id)" />
    </div>

    <!-- Tags -->
    <div class="flex items-center px-2 py-1 ml-2 -my-1 text-xs text-white bg-blue-800 rounded shadow" :style="{ backgroundColor: tag.color }" v-for="tag in selectedTags" :key="tag.id">
      <i class="mr-1 fa fa-tag text-2xs opacity-30" />
      {{ tag.name }}
      <i class="p-1 ml-1 -m-1 opacity-50 cursor-pointer fa fa-times text-2xs hover:opacity-100" @click="removeTagFilter(tag.id)" />
    </div>

    <!-- Clear -->
    <i class="p-1 ml-1 -m-1 text-xs text-gray-500 cursor-pointer fa fa-times-circle hover:text-red-500" title="Remove all filters" @click="removeAllFilters()" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { lastDay, tagsById, authorsById, playersById } from '../store/data'
  import { filter, removeAuthorFilter, removeTagFilter, removeAllFilters, prevDay, nextDay } from '../store/filter'
  import { prettyDate } from '../utils'

  const selectedAuthors = computed(() => [...filter.authorIds].map((authorId) => authorsById.value.get(authorId) as TAuthor))
  const selectedTags = computed(() => [...filter.tagIds].map((tagId) => tagsById.value.get(tagId) as TTag))
  const selectedPlayer = computed(() => playersById.value.get(filter.playerId) as TPlayer)
</script>
