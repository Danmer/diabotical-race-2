<template>
  <div class="relative flex flex-col flex-1 overflow-hidden" style="">
    <header class="relative z-20 text-sm font-bold shadow">
      <div class="flex items-center p-2 space-x-2 bg-gradient-to-br from-gray-800 to-gray-900">
        <div class="flex flex-1">
          <!-- Counter -->
          <div>
            <span v-show="foundMaps.length !== visibleMaps.length" class="hidden md:inline">{{ foundMaps.length }} of </span>
            {{ visibleMaps.length }} maps
          </div>

          <!-- Authors -->
          <div class="relative ml-4">
            <div class="text-gray-300 cursor-pointer select-none hover:text-white" @click="authorsDropdown.toggle()">
              <span v-show="foundAuthors.length !== visibleAuthors.length" class="hidden md:inline">{{ foundAuthors.length }} of </span>
              {{ visibleAuthors.length }} authors
              <i class="p-1 -m-1 text-xs fa fa-caret-down" />
            </div>
            <UiDropdown :dropdown="authorsDropdown" class="left-0 top-5" @close="filter.authorsSearch = ''" @clickOutside="authorsDropdown.close()">
              <AppAuthors />
            </UiDropdown>
          </div>

          <!-- Tags -->
          <div class="relative ml-4">
            <div class="text-gray-300 cursor-pointer select-none hover:text-white" @mousedown="tagsDropdown.toggle()">
              <span v-show="foundTags.length !== visibleTags.length" class="hidden md:inline">{{ foundTags.length }} of </span>
              {{ visibleTags.length }} tags
              <i class="p-1 -m-1 text-xs fa fa-caret-down" />
            </div>
            <UiDropdown :dropdown="tagsDropdown" class="left-0 top-5" @close="filter.tagsSearch = ''" @clickOutside="tagsDropdown.close()">
              <AppTags />
            </UiDropdown>
          </div>
        </div>

        <!-- Search -->
        <label class="relative flex items-center -my-1 transition-all rounded-sm" :class="[searchInput.value ? 'bg-blue-600' : searchInput.focused ? 'bg-gray-600' : 'transparent', searchInput.value || searchInput.focused ? 'w-24' : 'w-20']">
          <div class="absolute right-0 flex items-center text-gray-600 transition-opacity cursor-pointer hover:text-gray-300" :class="{ 'opacity-0': searchInput.value || searchInput.focused }">
            <i class="fa fa-search" />
            <span class="hidden ml-1 mr-2 md:inline">Search</span>
          </div>
          <div class="flex transition-opacity" :class="[{ 'opacity-0 pointer-events-none': !searchInput.value && !searchInput.focused }]">
            <UiInput :input="searchInput" class="w-full p-1" placeholder="Search" @input="filter.mapsSearch = $event" />
          </div>
        </label>

        <!-- Sort -->
        <div>
          <div class="flex items-center text-gray-600 cursor-pointer select-none hover:text-gray-300" :title="`Sorted by ${config.mapsSort}`" @click="sortDropdown.toggle()">
            <i class="mr-1 fa" :class="reverseSorting ? 'fa-sort-amount-down-alt' : 'fa-sort-amount-down'" />
            <span class="hidden md:inline">{{ sortDropdown.active ? 'Sort by' : config.mapsSort }}</span>
          </div>
          <UiDropdown :dropdown="sortDropdown" class="right-0 top-8" @clickOutside="sortDropdown.close()">
            <div class="text-xs text-white bg-gray-800 divide-y divide-gray-700 divide-opacity-50" @click="sortDropdown.close()">
              <div class="flex items-start justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ 'text-yellow-300': config.mapsSort === 'New runs' }" @click=";(config.mapsSort = 'New runs'), (reverseSorting = false)">
                <i class="mr-1 text-gray-500 fa fa-fw fa-running" />
                <span class="flex-1">New runs</span>
                <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.mapsSort === 'New runs' }" title="Sort descending" @click.stop=";(config.mapsSort = 'New runs'), (reverseSorting = false)" />
                <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.mapsSort === 'New runs' }" title="Sort ascending" @click.stop=";(config.mapsSort = 'New runs'), (reverseSorting = true)" />
              </div>
              <div class="flex items-start justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ 'text-yellow-300': config.mapsSort === 'Runs count' }" @click=";(config.mapsSort = 'Runs count'), (reverseSorting = false)">
                <i class="mr-1 text-gray-500 fa fa-fw fa-running" />
                <span class="flex-1">Runs count</span>
                <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.mapsSort === 'Runs count' }" title="Sort descending" @click.stop=";(config.mapsSort = 'Runs count'), (reverseSorting = false)" />
                <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.mapsSort === 'Runs count' }" title="Sort ascending" @click.stop=";(config.mapsSort = 'Runs count'), (reverseSorting = true)" />
              </div>
              <div class="flex items-start justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ 'text-yellow-300': config.mapsSort === 'Date' }" @click=";(config.mapsSort = 'Date'), (reverseSorting = false)">
                <i class="mr-1 text-gray-500 fa fa-fw fa-calendar" />
                <span class="flex-1">New maps</span>
                <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.mapsSort === 'Date' }" title="Sort descending" @click.stop=";(config.mapsSort = 'Date'), (reverseSorting = false)" />
                <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.mapsSort === 'Date' }" title="Sort ascending" @click.stop=";(config.mapsSort = 'Date'), (reverseSorting = true)" />
              </div>
              <div class="flex items-start justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ 'text-yellow-300': config.mapsSort === 'Duration' }" @click=";(config.mapsSort = 'Duration'), (reverseSorting = false)">
                <i class="mr-1 text-gray-500 fa fa-fw fa-stopwatch" />
                <span class="flex-1">Duration</span>
                <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.mapsSort === 'Duration' }" title="Sort descending" @click.stop=";(config.mapsSort = 'Duration'), (reverseSorting = false)" />
                <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.mapsSort === 'Duration' }" title="Sort ascending" @click.stop=";(config.mapsSort = 'Duration'), (reverseSorting = true)" />
              </div>
              <div class="flex items-start justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ '!text-yellow-300': config.mapsSort === 'Name' }" @click=";(config.mapsSort = 'Name'), (reverseSorting = false)">
                <i class="mr-1 text-gray-500 fa fa-fw fa-font" />
                <span class="flex-1">Name</span>
                <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.mapsSort === 'Name' }" title="Sort descending" @click.stop=";(config.mapsSort = 'Name'), (reverseSorting = false)" />
                <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.mapsSort === 'Name' }" title="Sort ascending" @click.stop=";(config.mapsSort = 'Name'), (reverseSorting = true)" />
              </div>
            </div>
          </UiDropdown>
        </div>
        <!-- <i class="text-gray-600 cursor-pointer fa fa-sort hover:text-gray-300" title="Order" @click="reverseSorting = !reverseSorting" /> -->
      </div>
      <AppFilter />
    </header>

    <!-- Maps -->
    <UiList v-if="sortedMaps.length" :count="15" :fillers="10" :animation="null" ref="listComponent" class="flex flex-wrap content-start flex-1 p-2 overflow-x-hidden overflow-y-scroll justify-evenly">
      <AppMap v-for="map in sortedMaps" :key="map.id" :map="map" class="flex-1 m-2" :style="{ minWidth }" />
    </UiList>
    <div v-else class="items-center justify-center flex-1 w-full h-full overflow-x-hidden overflow-y-scroll text-xl font-bold text-shadow" style="display: flex">Loading...</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, reactive } from 'vue'
  import { visibleMaps, visibleTags, visibleAuthors, days } from '../store/data'
  import { config } from '../store/config'
  import { filter } from '../store/filter'
  import { compareStrings } from '../utils'
  import AppAuthors from './Authors.vue'
  import AppTags from './Tags.vue'
  import AppMap from './Map.vue'
  import AppFilter from './Filter.vue'

  const listComponent = ref()
  const searchInput = reactive({ value: filter.mapsSearch, lowercase: true, clearable: true } as TInput)

  const authorsDropdown = ref({} as TDropdown)
  const tagsDropdown = ref({} as TDropdown)
  const sortDropdown = ref({} as TDropdown)

  const reverseSorting = ref(false)

  const minWidth = computed(() => (config.runDates ? '23rem' : '21rem'))

  const foundMaps = computed(() => visibleMaps.value.filter((map) => !map.faded))
  const foundTags = computed(() => visibleTags.value.filter((tag) => !tag.faded))
  const foundAuthors = computed(() => visibleAuthors.value.filter((author) => !author.faded))

  const sortedMaps = computed(() => {
    const r = reverseSorting.value ? -1 : 1
    switch (config.mapsSort.toLowerCase()) {
      case 'new runs':
        const mapIds = days.value.reduce((list, day) => list.concat([...day.maps.keys()], [...day.newMaps.keys()].reverse()), [] as TMapId[])
        return visibleMaps.value.sort((a, b) => a.faded - b.faded || r * (b.newRuns.size - a.newRuns.size) || r * (mapIds.indexOf(a.id) - mapIds.indexOf(b.id)) || r * compareStrings(b.since, a.since))
      case 'runs count':
        return visibleMaps.value.sort((a, b) => a.faded - b.faded || r * (b.records.size - a.records.size))
      // return visibleMaps.value.sort((a, b) => a.faded - b.faded || r * ([...b.records.values()].filter((r) => r.physicsId === 'vintage').length - [...a.records.values()].filter((r) => r.physicsId === 'vintage').length))
      case 'date':
        return visibleMaps.value.sort((a, b) => a.faded - b.faded || r * compareStrings(b.since, a.since))
      case 'duration':
        return visibleMaps.value.sort((a, b) => a.faded - b.faded || r * (b.records.size && !a.records.size ? 1 : !b.records.size && a.records.size ? -1 : 0) || r * ([...b.records.values()][0]?.time || 0) - ([...a.records.values()][0]?.time || 0))
      case 'name':
        return visibleMaps.value.sort((a, b) => a.faded - b.faded || r * compareStrings(a.name, b.name))
      default:
        return visibleMaps.value
    }
  })

  watch([() => filter.tagIds, () => filter.authorIds, () => filter.mapsSearch, () => filter.playerId, () => config.mapsSort], () => {
    if (filter.mapsSearch) {
      searchInput.value = filter.mapsSearch
    }
    if (listComponent.value) {
      listComponent.value.page = 1
      listComponent.value.scrollToTop()
    }
  })
</script>
