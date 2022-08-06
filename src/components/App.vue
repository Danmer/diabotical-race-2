<template>
  <div class="relative flex flex-col h-screen overflow-hidden">
    <header class="sticky top-0 z-50 flex items-center justify-between font-bold bg-gray-900 bg-left bg-no-repeat bg-contain">
      <video ref="logo" src="../assets/logo.mp4" poster="../assets/logo.jpg" class="h-10 -mx-2 cursor-pointer logo" muted autoplay loop @click="config.animationLogo = !config.animationLogo"></video>
      <div class="w-4 h-10 -mr-2 transform -skew-x-12 bg-gray-900"></div>
      <div class="relative flex items-center flex-1 p-2 text-lg font-bold text-white uppercase">
        <span class="hidden sm:inline">Diabotical</span>
        <span class="mx-1">RACE</span>
        <!-- <span class="p-1 mx-1 text-sm text-white bg-red-600 rounded">WIP</span> -->
        <span class="p-1 mx-1 text-sm text-white bg-purple-600 rounded" title="Moderator mode" v-if="token">MOD</span>
      </div>
      <!-- Status -->
      <div class="items-center hidden text-sm lg:flex">
        <!-- <div class="mr-6">{{ prettyTime(duration.totalTime) }}</div> -->
        <div v-for="stats in physicsStats" :key="stats.id" class="mr-6 text-gray-200 cursor-pointer hover:text-yellow-100" :title="stats.title" @click="physicsSwitcher = stats.id">
          <div class="hidden capitalize sm:block">{{ stats.id }}: {{ stats.recordsPercent }}%</div>
          <div class="h-1 mt-1 overflow-hidden bg-gray-700 rounded width-full">
            <div class="h-1 transition-all duration-300 rounded-r" :class="filter.playerId ? 'bg-blue-600' : userId ? 'bg-green-600' : 'bg-gray-400'" :style="{ width: stats.recordsPercent + '%' }"></div>
          </div>
        </div>
      </div>
      <!-- Buttons -->
      <div class="flex items-stretch">
        <a class="relative items-center hidden px-5 py-2 border-l border-gray-800 cursor-pointer select-none md:flex bg-gradient-to-br from-purple-800 to-gray-900 hover:from-purple-600" href="https://discord.gg/9539Gfj" title="Diabotical Racing Discord" target="_blank" rel="noopener">
          <img class="h-6" src="../assets/discord.png" alt="Discord" />
        </a>
        <a class="relative items-center hidden px-5 py-2 border-l border-gray-800 cursor-pointer select-none md:flex bg-gradient-to-br from-yellow-800 to-gray-900 hover:from-yellow-700" title="Statistics" href="./stats.html" target="_blank" rel="noopener">
          <i class="text-xl fa fa-chart-bar" />
        </a>
        <a class="relative items-center hidden px-5 py-2 border-l border-gray-800 cursor-pointer select-none md:flex bg-gradient-to-br from-red-800 to-gray-900 hover:from-red-600" href="https://www.youtube.com/playlist?list=PLuji2V2SFYVI51lkv1qlU91SX_Pm43jv6" title="World Records Playlist" target="_blank" rel="noopener">
          <img class="h-6" src="../assets/youtube.png" alt="Youtube" />
        </a>
        <div class="relative flex items-center px-5 py-2 uppercase border-l border-gray-800 cursor-pointer select-none bg-gradient-to-br from-blue-800 to-gray-900 hover:from-blue-600" title="Submit map" @click="modalMap.open()">
          <img class="h-6" src="../assets/worker.svg" alt="" />
          <span class="hidden ml-3 md:inline">Submit map</span>
        </div>
        <div class="relative flex items-center px-5 py-2 uppercase border-l border-gray-800 cursor-pointer select-none bg-gradient-to-br from-green-800 to-gray-900 hover:from-green-600" title="Submit run" @click="modalRun.open()">
          <img class="h-6" src="../assets/finish.svg" alt="" />
          <span class="hidden ml-3 md:inline">Submit run</span>
        </div>
        <div class="relative">
          <div class="relative flex items-center h-full px-5 py-2 border-l border-gray-800 cursor-pointer select-none bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-500" title="Settings" @click="settingsDropdown.toggle()">
            <i class="text-xl fa fa-cog" />
          </div>
          <UiDropdown :dropdown="settingsDropdown" class="right-0 top-full" @clickOutside="settingsDropdown.close()">
            <AppSettings />
          </UiDropdown>
        </div>
      </div>
    </header>

    <main class="flex items-stretch flex-1 w-full overflow-hidden">
      <AppDays v-if="config.days" />
      <AppMaps />
      <AppPlayers v-if="config.players" />
    </main>

    <!-- <AppLights class="absolute left-0 right-0 !-top-10 z-50" /> -->

    <!-- <div class="absolute top-0 left-0 right-0 h-[4.65rem] z-50 pointer-events-none snowflakes"></div> -->

    <AppModals />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue'
  import { useSwipe } from '@vueuse/core'
  import { physicsSwitcher } from '../store'
  import { config } from '../store/config'
  import { filter } from '../store/filter'
  import { slided, focused } from '../store/index'
  import { physicsById, visiblePlayers, updateData, visibleRuns } from '../store/data'
  import { modalRun, modalMap } from '../store/ui'
  import { token, userId } from '../store/storage'
  import AppSettings from './Settings.vue'
  import AppDays from './Days.vue'
  import AppMaps from './Maps.vue'
  import AppPlayers from './Players.vue'
  import AppModals from './Modals.vue'
  // import AppLights from './Lights.vue'

  const logo = ref<HTMLVideoElement>()

  const settingsDropdown = ref({} as TDropdown)

  const physicsStats = computed(() => {
    return [...physicsById.value.entries()].map(([physicsId, physics]) => {
      const records = [...physics.records.values()].filter((record) => !record.map.tags.has('archived') && (filter.playerId ? filter.playerId === record.playerId : userId.value ? userId.value === record.playerId : record.wr))
      const playersCount = visiblePlayers.value.filter((player) => player.bestPhysics === physicsId).length
      const recordsCount = records.length
      const recordsMax = [...physics.maps.values()].filter((map) => !map.tags.has('archived')).length
      const recordsPercent = Math.round((100 * recordsCount) / recordsMax)
      return {
        ...physics,
        recordsPercent,
        title: `${recordsCount} of ${recordsMax} maps with records\n${playersCount} of ${visiblePlayers.value.length} players prefer this physics`,
      }
    })
  })

  const duration = computed(() => {
    let wrTime = 0
    let pbTime = 0
    let totalTime = 0
    const runs = visibleRuns.value.filter((run) => !run.map.tags.has('archived') && (filter.playerId ? filter.playerId === run.playerId : userId.value ? userId.value === run.playerId : true))
    for (const run of runs) {
      if (run.wr) {
        wrTime += run.time
      }
      if (run.pb) {
        pbTime += run.time
      }
      totalTime += run.time
    }
    return { wrTime, pbTime, totalTime }
  })

  useSwipe(document, {
    onSwipeEnd(e, direction) {
      if (direction === 'LEFT') {
        slided.value = Math.min(1, slided.value + 1)
      }
      if (direction === 'RIGHT') {
        slided.value = Math.max(-1, slided.value - 1)
      }
    },
  })

  onMounted(() => {
    updateData()

    watchEffect(async () => {
      if (logo.value) {
        try {
          if (config.animationLogo && focused.value) {
            await logo.value.play()
          } else {
            logo.value.pause()
          }
        } catch (error) {}
      }
    })
  })
</script>

<style scoped>
  .april-1 .logo {
    transform: rotate(180deg);
  }
  .logo:hover {
    filter: brightness(1.2);
  }
  .snowflakes {
    background-image: url('../assets/snowflakes.png');
  }
</style>
