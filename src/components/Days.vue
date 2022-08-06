<template>
  <aside class="z-30 flex flex-col transition-transform duration-300 transform bg-gray-700 shadow -ml-80 sm:ml-0 w-80" :class="{ 'translate-x-80 sm:translate-x-0': slided === -1 }">
    <header class="relative z-40 flex items-center p-2 space-x-2 text-sm font-bold shadow bg-gradient-to-br from-gray-800 to-gray-900">
      <div class="flex-1">
        <span v-show="visibleRuns.length !== runsById.size">{{ visibleRuns.length }} of </span>
        {{ runsById.size }} submissions
      </div>
      <!-- Search -->
      <label class="relative flex items-center -my-1 transition-all rounded-sm" :class="[searchInput.value ? 'bg-blue-600' : searchInput.focused ? 'bg-gray-600' : 'transparent', searchInput.value || searchInput.focused ? 'w-24' : 'w-20']">
        <div class="absolute right-0 flex items-center text-gray-600 transition-opacity cursor-pointer hover:text-gray-300" :class="{ 'opacity-0': searchInput.value || searchInput.focused }">
          <i class="fa fa-search" />
          <span class="ml-1 mr-2">Search</span>
        </div>
        <div class="flex transition-opacity" :class="[{ 'opacity-0 pointer-events-none': !searchInput.value && !searchInput.focused }]">
          <UiInput :input="searchInput" class="w-full p-1" placeholder="Search" @input="filter.runsSearch = $event" />
        </div>
      </label>
      <!-- Play -->
      <i v-if="lastDay !== filter.dayId && playing" class="text-gray-600 cursor-pointer fa fa-pause hover:text-gray-300" title="Pause" @click="pauseDays()" />
      <i v-if="lastDay !== filter.dayId && !playing" class="text-gray-600 cursor-pointer fa fa-play hover:text-gray-300" title="Days playback" @click="playDays()" />
      <!-- Update -->
      <i class="text-gray-600 cursor-pointer fa fa-sync-alt hover:text-gray-300" title="Update data" @click="updateData()" />
      <!-- Collapse -->
      <i class="text-gray-600 cursor-pointer fa fa-calendar hover:text-gray-300" title="Expanded days" @click="daysCollapser = !daysCollapser" />
    </header>

    <UiList v-if="runsById.size" ref="listComponent" class="flex flex-col flex-1 overflow-x-hidden overflow-y-scroll" :count="7">
      <AppDay v-for="day in visibleDays" :key="day.id" :day="day" class="py-1" />
    </UiList>
    <div v-else class="items-center justify-center flex-1 w-full h-full overflow-x-hidden overflow-y-scroll text-xl font-bold text-shadow" style="display: flex">Loading...</div>

    <a v-if="cup.link" class="relative w-full h-[11rem] bg-cover" :href="cup.link" target="_blank" :style="{ backgroundImage: `url('./img/cup.jpg')` }">
      <span class="absolute text-xl font-bold right-4 bottom-3">{{ timeAgo }}</span>
    </a>

    <div>
      <AppEggcup v-for="eggcup in eggcups" :eggcup="eggcup" />
      <div v-if="token" class="p-2 text-sm font-bold text-center uppercase cursor-pointer select-none bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700" @click="modalEggcup.open()">
        <i class="text-yellow-400 fa fa-trophy" />
        &nbsp;Create EGG CUP
      </div>
    </div>

    <div class="absolute bottom-0 flex items-center p-1 font-bold transition-opacity cursor-pointer sm:hidden left-full rounded-tr-xl" :class="lastDay !== filter.dayId ? 'bg-blue-700 hover:bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'">
      <i v-if="slided === -1" class="p-1 mr-1 fa fa-fw fa-arrow-alt-circle-left" @click="slided = 0" />
      <div v-else class="flex items-center p-1" @click="slided = -1">
        <i class="fa fa-fw fa-arrow-alt-circle-right" />
        <div v-if="lastDay !== filter.dayId" class="ml-1">{{ prettyDay(filter.dayId) }}</div>
        <div v-else class="ml-1">Runs</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, computed } from 'vue'
  import { visibleDays, visibleRuns, runsById, updateData, lastDay, eggcups, cup } from '../store/data'
  import { token } from '../store/storage'
  import { now, slided, daysCollapser } from '../store/index'
  import { filter } from '../store/filter'
  import { modalEggcup } from '../store/ui'
  import { prettyDay, prettyTime } from '../utils'
  import AppDay from './Day.vue'
  import AppEggcup from './Eggcup.vue'

  const listComponent = ref()
  const playing = ref(false)
  const searchInput = reactive({ value: filter.runsSearch, lowercase: true, clearable: true } as TInput)

  const timeAgo = computed(() => {
    const since = new Date(now.value).getTime()
    const until = new Date(cup.value.date).getTime()
    return since < until ? prettyTime(until - since, { ms: false }) : ''
  })

  watch([() => filter.playerId, () => filter.runsSearch, () => filter.tagIds, () => filter.authorIds], () => {
    if (listComponent.value) {
      listComponent.value.page = 1
      listComponent.value.scrollToTop()
    }
  })

  watch(daysCollapser, (newValue) => {
    if (newValue) {
      setTimeout(() => {
        listComponent.value.showNextPage()
      }, 300)
    }
  })

  let playingInterval = 0
  function playDays() {
    playing.value = true
    playingInterval = setInterval(nextDay, 2000)
  }

  function pauseDays() {
    playing.value = false
    clearInterval(playingInterval)
  }

  function nextDay() {
    const currentIndex = visibleDays.value.findIndex((day) => day.id === filter.dayId)
    if (currentIndex) {
      filter.dayId = visibleDays.value[currentIndex - 1].id
    } else {
      pauseDays()
    }
  }
</script>
