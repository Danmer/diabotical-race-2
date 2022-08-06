<template>
  <aside class="relative z-30 flex flex-col transition-transform duration-300 transform bg-gray-700 shadow -mr-80 lg:mr-0 w-80" :class="{ '-translate-x-80 lg:translate-x-0': slided === 1 }">
    <header class="relative z-40 flex items-center p-2 space-x-2 text-sm font-bold shadow bg-gradient-to-br from-gray-800 to-gray-900">
      <div class="flex-1">
        <span v-show="foundPlayers.length !== visiblePlayers.length">{{ foundPlayers.length }} of </span>
        {{ visiblePlayers.length }} players
      </div>
      <!-- Search -->
      <label class="relative flex items-center p-1 -my-1 transition-all rounded-sm" :class="[searchInput.value ? 'bg-blue-600' : searchInput.focused ? 'bg-gray-600' : 'transparent', searchInput.value || searchInput.focused ? 'w-24' : 'w-20']">
        <div class="absolute right-0 flex items-center text-gray-600 transition-opacity cursor-pointer hover:text-gray-300" :class="{ 'opacity-0': searchInput.value || searchInput.focused }">
          <i class="fa fa-search" />
          <span class="ml-1 mr-2">Search</span>
        </div>
        <div class="flex transition-opacity" :class="[{ 'opacity-0 pointer-events-none': !searchInput.value && !searchInput.focused }]">
          <UiInput :input="searchInput" class="w-full" placeholder="Search" @input="filter.playersSearch = $event" />
        </div>
      </label>
      <!-- Sort -->
      <div>
        <div class="flex items-center text-gray-600 cursor-pointer select-none hover:text-gray-300" :title="`Sorted by ${config.playersSort}`" @click="sortDropdown.toggle()">
          <i class="mr-1 fa fa-sort-amount-down" />
          {{ sortDropdown.active ? 'Sort by' : config.playersSort }}
        </div>
        <UiDropdown :dropdown="sortDropdown" class="absolute right-0 top-8" @clickOutside="sortDropdown.close()">
          <div class="text-xs text-white bg-gray-800 divide-y divide-gray-700 divide-opacity-50" @click="sortDropdown.close()">
            <div class="flex justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ '!text-yellow-300': config.playersSort === 'Medals' }" @click=";(config.playersSort = 'Medals'), (reverseSorting = false)">
              <i class="mr-1 text-gray-500 fa fa-fw fa-medal" />
              <span class="flex-1">Medals</span>
              <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.playersSort === 'Medals' }" title="Sort descending" @click.stop=";(config.playersSort = 'Medals'), (reverseSorting = false)" />
              <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.playersSort === 'Medals' }" title="Sort ascending" @click.stop=";(config.playersSort = 'Medals'), (reverseSorting = true)" />
            </div>
            <div class="flex justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ '!text-yellow-300': config.playersSort === 'Runs' }" @click=";(config.playersSort = 'Runs'), (reverseSorting = false)">
              <i class="mr-1 text-gray-500 fa fa-fw fa-running" />
              <span class="flex-1">Runs</span>
              <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.playersSort === 'Runs' }" title="Sort descending" @click.stop=";(config.playersSort = 'Runs'), (reverseSorting = false)" />
              <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.playersSort === 'Runs' }" title="Sort ascending" @click.stop=";(config.playersSort = 'Runs'), (reverseSorting = true)" />
            </div>
            <div class="flex justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ '!text-yellow-300': config.playersSort === 'Maps' }" @click=";(config.playersSort = 'Maps'), (reverseSorting = false)">
              <i class="mr-1 text-gray-500 fa fa-fw fa-image" />
              <span class="flex-1">Maps</span>
              <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.playersSort === 'Maps' }" title="Sort descending" @click.stop=";(config.playersSort = 'Maps'), (reverseSorting = false)" />
              <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.playersSort === 'Maps' }" title="Sort ascending" @click.stop=";(config.playersSort = 'Maps'), (reverseSorting = true)" />
            </div>
            <!-- <div class="flex justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ '!text-yellow-300': config.playersSort === 'Followers' }" @click="config.playersSort = 'Followers'">
            Followers
            <i class="text-gray-500 fa fa-fw fa-user" />
          </div> -->
            <div class="flex justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ '!text-yellow-300': config.playersSort === 'Name' }" @click=";(config.playersSort = 'Name'), (reverseSorting = false)">
              <i class="mr-1 text-gray-500 fa fa-fw fa-font" />
              <span class="flex-1">Name</span>
              <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.playersSort === 'Name' }" title="Sort descending" @click.stop=";(config.playersSort = 'Name'), (reverseSorting = false)" />
              <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.playersSort === 'Name' }" title="Sort ascending" @click.stop=";(config.playersSort = 'Name'), (reverseSorting = true)" />
            </div>
            <div class="flex justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ '!text-yellow-300': config.playersSort === 'Country' }" @click=";(config.playersSort = 'Country'), (reverseSorting = false)">
              <i class="mr-1 text-gray-500 fa fa-fw fa-flag" />
              <span class="flex-1">Country</span>
              <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.playersSort === 'Country' }" title="Sort descending" @click.stop=";(config.playersSort = 'Country'), (reverseSorting = false)" />
              <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.playersSort === 'Country' }" title="Sort ascending" @click.stop=";(config.playersSort = 'Country'), (reverseSorting = true)" />
            </div>
            <div class="flex justify-between p-2 cursor-pointer hover:bg-gray-900" :class="{ '!text-yellow-300': config.playersSort === 'Rating' }" :title="`Rating\nEach map's total places\nminus player's placement\nmultiply on WR difference`" @click=";(config.playersSort = 'Rating'), (reverseSorting = false)">
              <i class="mr-1 text-gray-500 fa fa-fw fa-star" />
              <span class="flex-1">Rating <span class="text-gray-500">(beta)</span></span>
              <i class="p-1 ml-5 -m-1 text-gray-500 fa fa-fw fa-caret-down hover:text-gray-300" :class="{ 'text-yellow-300': !reverseSorting && config.playersSort === 'Rating' }" title="Sort descending" @click.stop=";(config.playersSort = 'Rating'), (reverseSorting = false)" />
              <i class="p-1 ml-0 -m-1 text-gray-500 fa fa-fw fa-caret-up hover:text-gray-300" :class="{ 'text-yellow-300': reverseSorting && config.playersSort === 'Rating' }" title="Sort ascending" @click.stop=";(config.playersSort = 'Rating'), (reverseSorting = true)" />
            </div>
          </div>
        </UiDropdown>
      </div>
    </header>

    <UiList v-if="sortedPlayers.length" :count="50" ref="listComponent" class="flex-1 overflow-x-hidden overflow-y-scroll">
      <AppPlayer v-for="player in sortedPlayers" :key="player.id" :player="player" />
    </UiList>
    <div v-else class="items-center justify-center flex-1 w-full h-full overflow-x-hidden overflow-y-scroll text-xl font-bold text-shadow" style="display: flex">Loading...</div>

    <iframe v-if="isTimconLive" class="w-full aspect-video" :src="`https://player.twitch.tv/?channel=timconlan&parent=${hostname}`" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>

    <div class="absolute bottom-0 flex items-center p-1 font-bold transition-opacity cursor-pointer lg:hidden right-full rounded-tl-xl" :class="filter.playerId ? 'bg-blue-700 hover:bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'">
      <i v-if="slided === 1" class="p-1 mr-1 fa fa-fw fa-arrow-alt-circle-right" @click="slided = 0" />
      <div v-else class="flex items-center p-1" @click="slided = 1">
        <UiPlayer v-if="activePlayer" class="mr-1" :player="activePlayer" />
        <div v-else class="mr-1">Players</div>
        <i class="fa fa-fw fa-arrow-alt-circle-left" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref, computed, watch, reactive } from 'vue'
  import { slided } from '../store'
  import { config } from '../store/config'
  import { filter } from '../store/filter'
  import { playersById, visiblePlayers } from '../store/data'
  import { compareStrings } from '../utils'
  import { streamsById } from '../store/streams'
  import AppPlayer from './Player.vue'

  const hostname = window.location.hostname

  const listComponent = ref()
  const sortDropdown = ref({} as TDropdown)
  const searchInput = reactive({ value: filter.playersSearch, lowercase: true, clearable: true } as TInput)
  const reverseSorting = ref(false)

  // computed

  const isTimconLive = computed(() => streamsById.value.get(257420273))
  // const isTimconLive = computed(() => streamsById.value.get(257420273)?.title?.toLowerCase().includes('time trials'))

  const activePlayer = computed(() => playersById.value.get(filter.playerId) as TPlayer)

  const foundPlayers = computed(() => visiblePlayers.value.filter((player) => !player.faded))

  const sortedPlayers = computed(() => {
    // (!a.stream && b.stream) ? 1 : 0
    const r = reverseSorting.value ? -1 : 1
    switch (config.playersSort.toLowerCase()) {
      case 'medals':
        return visiblePlayers.value.sort((a, b) => a.faded - b.faded || (config.streamersOnTop ? (a.stream && !b.stream ? -1 : !a.stream && b.stream ? 1 : 0) : 0) || r * (b.medals[1] - a.medals[1] || b.medals[2] - a.medals[2] || b.medals[3] - a.medals[3] || b.records.size - a.records.size || b.runs.size - a.runs.size))
      case 'rating':
        for (const player of visiblePlayers.value) {
          player.placement = window.getPlacement(player)
        }
        return visiblePlayers.value.sort((a, b) => a.faded - b.faded || (config.streamersOnTop ? (a.stream && !b.stream ? -1 : !a.stream && b.stream ? 1 : 0) : 0) || b.placement - a.placement || r * (b.rating - a.rating || a.records.size - b.records.size || a.runs.size - b.runs.size))
      case 'runs':
        return visiblePlayers.value.sort((a, b) => a.faded - b.faded || (config.streamersOnTop ? (a.stream && !b.stream ? -1 : !a.stream && b.stream ? 1 : 0) : 0) || r * (b.records.size - a.records.size || b.runs.size - a.runs.size))
      case 'maps':
        return visiblePlayers.value.sort((a, b) => a.faded - b.faded || (config.streamersOnTop ? (a.stream && !b.stream ? -1 : !a.stream && b.stream ? 1 : 0) : 0) || r * (b.maps.size - a.maps.size || b.records.size - a.records.size || b.runs.size - a.runs.size))
      case 'name':
        return visiblePlayers.value.sort((a, b) => a.faded - b.faded || (config.streamersOnTop ? (a.stream && !b.stream ? -1 : !a.stream && b.stream ? 1 : 0) : 0) || r * compareStrings(a.name, b.name))
      case 'country':
        return visiblePlayers.value.sort((a, b) => a.faded - b.faded || (config.streamersOnTop ? (a.stream && !b.stream ? -1 : !a.stream && b.stream ? 1 : 0) : 0) || r * compareStrings(a.flag || 'zzz', b.flag || 'zzz') || r * compareStrings(a.name, b.name))
      case 'followers':
        return visiblePlayers.value.sort((a, b) => a.faded - b.faded || (config.streamersOnTop ? (a.stream && !b.stream ? -1 : !a.stream && b.stream ? 1 : 0) : 0) || r * (b.twitchFollowers - a.twitchFollowers))
      default:
        return visiblePlayers.value
    }
  })

  // watchers

  watch([() => filter.dayId, () => filter.tagIds, () => filter.authorIds, () => filter.playersSearch, () => config.playersSort], () => {
    if (listComponent.value) {
      listComponent.value.page = 1
      listComponent.value.scrollToTop()
    }
  })
</script>
