<template>
  <div class="w-64 text-sm text-white bg-gray-800 divide-y divide-gray-700 divide-opacity-50">
    <div class="overflow-y-auto max-h-[80vh] leading-4">
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="modalPlayer.open()">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-user" />You</div>
        <div v-if="name"><UiPlayer :player="{ name, flag }" /></div>
        <div v-else>SELECT</div>
      </div>
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.defaultPhysics = config.defaultPhysics === 'auto' ? 'race' : config.defaultPhysics === 'race' ? 'vintage' : config.defaultPhysics === 'vintage' ? 'diabotical' : 'auto'">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-running" />Default physics</div>
        <div class="uppercase" :class="config.defaultPhysics === 'auto' ? 'text-green-500' : 'text-yellow-400'">{{ config.defaultPhysics }}</div>
      </div>
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.dataUpdating = nextValue(config.dataUpdating, [0, 600000, 3600000, 86400000])">
        <div class="flex-1 overflow-hidden"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-sync-alt" />Auto updating</div>
        <div :class="config.dataUpdating ? 'text-green-500' : 'text-red-500'">{{ config.dataUpdating ? prettyDuration(config.dataUpdating / 1000) : 'OFF' }}</div>
      </div>

      <!-- Maps -->
      <hr class="border-gray-700 border-opacity-50" />
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.mapIds = !config.mapIds">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-passport" />Map IDs</div>
        <div :class="config.mapIds ? 'text-green-500' : 'text-red-500'">{{ config.mapIds ? 'ON' : 'OFF' }}</div>
      </div>
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.mapThumbnails = !config.mapThumbnails">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-image" />Map thumbnails</div>
        <div :class="config.mapThumbnails ? 'text-green-500' : 'text-red-500'">{{ config.mapThumbnails ? 'ON' : 'OFF' }}</div>
      </div>
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.mapTags = !config.mapTags">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-tag" />Map tags</div>
        <div :class="config.mapTags ? 'text-green-500' : 'text-red-500'">{{ config.mapTags ? 'ON' : 'OFF' }}</div>
      </div>
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.mapDates = !config.mapDates">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-calendar" />Map dates</div>
        <div :class="config.mapDates ? 'text-green-500' : 'text-red-500'">{{ config.mapDates ? 'ON' : 'OFF' }}</div>
      </div>

      <!-- Runs -->
      <hr class="border-gray-700 border-opacity-50" />
      <div class="flex items-start p-2 cursor-pointer hover:bg-gray-900" @click="config.lists = config.lists === 'records' ? 'runs' : 'records'">
        <div class="flex-1 overflow-hidden"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-th-list" />Runs</div>
        <div :class="config.lists === 'records' ? 'text-green-500' : 'text-blue-500'">{{ config.lists === 'records' ? 'BEST' : 'ALL' }}</div>
      </div>
      <div class="flex p-2 hover:bg-gray-900">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-list-ol" />Runs in a list</div>
        <div class="select-none" :class="config.runsCount ? 'text-green-500' : 'text-red-500'">
          <i class="mx-1 text-xs fa fa-minus-circle" :class="config.runsCount === 0 ? 'opacity-25' : 'cursor-pointer hover:text-white'" @click="config.runsCount = Math.max(config.runsCount - 1, 0)" />
          {{ config.runsCount }}
          <i class="ml-1 text-xs fa fa-plus-circle" :class="config.runsCount === 99 ? 'opacity-25' : 'cursor-pointer hover:text-white'" @click="config.runsCount = Math.min(config.runsCount + 1, 99)" />
        </div>
      </div>
      <div class="flex p-2 hover:bg-gray-900">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-calendar" />New days</div>
        <div class="text-green-500 select-none">
          <i class="mx-1 text-xs fa fa-minus-circle" :class="config.newDays === 1 ? 'opacity-25' : 'cursor-pointer hover:text-white'" @click="config.newDays = Math.max(config.newDays - 1, 1)" />
          {{ config.newDays }}
          <i class="ml-1 text-xs fa fa-plus-circle" :class="config.newDays === 99 ? 'opacity-25' : 'cursor-pointer hover:text-white'" @click="config.newDays = Math.min(config.newDays + 1, 99)" />
        </div>
      </div>
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.runDates = !config.runDates">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-calendar" />Run dates</div>
        <div :class="config.runDates ? 'text-green-500' : 'text-red-500'">{{ config.runDates ? 'ON' : 'OFF' }}</div>
      </div>
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.runThumbnails = !config.runThumbnails">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-image" />Run thumbnails</div>
        <div :class="config.runThumbnails ? 'text-green-500' : 'text-red-500'">{{ config.runThumbnails ? 'ON' : 'OFF' }}</div>
      </div>

      <!-- Players -->
      <hr class="border-gray-700 border-opacity-50" />
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.streamsUpdating = nextValue(config.streamsUpdating, [0, 60000, 300000, 600000, 1800000, 3600000])">
        <div class="flex-1 overflow-hidden"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-video" />Player streams</div>
        <div :class="config.streamsUpdating ? 'text-green-500' : 'text-red-500'">{{ config.streamsUpdating ? prettyDuration(config.streamsUpdating / 1000) : 'OFF' }}</div>
      </div>
      <div class="flex items-start p-2 cursor-pointer hover:bg-gray-900" @click="config.streamersOnTop = !config.streamersOnTop">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-thumbtack" />Live on the top</div>
        <div :class="config.streamersOnTop ? 'text-green-500' : 'text-red-500'">{{ config.streamersOnTop ? 'ON' : 'OFF' }}</div>
      </div>
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.playerPhysics = !config.playerPhysics">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-running" />Preferred physics</div>
        <div :class="config.playerPhysics ? 'text-green-500' : 'text-red-500'">{{ config.playerPhysics ? 'ON' : 'OFF' }}</div>
      </div>

      <!-- Panels -->
      <hr class="border-gray-700 border-opacity-50" />
      <div class="flex items-start p-2 cursor-pointer hover:bg-gray-900" @click="config.days = !config.days">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-columns" />List of days</div>
        <div :class="config.days ? 'text-green-500' : 'text-red-500'">{{ config.days ? 'ON' : 'OFF' }}</div>
      </div>
      <div class="flex items-start p-2 cursor-pointer hover:bg-gray-900" @click="config.players = !config.players">
        <div class="flex-1 overflow-hidden"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-columns" />List of players</div>
        <div :class="config.players ? 'text-green-500' : 'text-red-500'">{{ config.players ? 'ON' : 'OFF' }}</div>
      </div>

      <!-- Other -->
      <hr class="border-gray-700 border-opacity-50" />
      <div class="flex p-2 cursor-pointer hover:bg-gray-900" @click="config.animation = !config.animation">
        <div class="flex-1"><i class="mr-2 text-center text-gray-500 fa fa-fw fa-random" />Animation</div>
        <div :class="config.animation ? 'text-green-500' : 'text-red-500'">{{ config.animation ? 'AUTO' : 'OFF' }}</div>
      </div>
    </div>

    <!-- Links -->
    <div class="flex p-2 justify-evenly">
      <div>
        Follow:
        <a href="https://twitter.com/quakelife" target="_blank"><img class="inline-block h-4 ml-1 -my-1" src="../assets/twitter.png" alt="twitter" /></a>
        <a href="https://vk.com/quakelife" target="_blank"><img class="inline-block h-4 ml-1 -my-1" src="../assets/vk.png" alt="vk" /></a>
      </div>
      <div>
        Donate:
        <a href="https://paypal.me/danmer" target="_blank"><img class="inline-block h-4 ml-1 -my-1" src="../assets/paypal.png" alt="paypal" /></a>
        <a href="https://yoomoney.ru/to/41001698799375" target="_blank"><img class="inline-block h-4 ml-1 -my-1" src="../assets/yoomoney.png" alt="yoomoney" /></a>
      </div>
    </div>

    <!-- Copyright -->
    <div class="p-2 text-xs text-center text-gray-500 font-normal !leading-4">
      <div>
        <span @click="modalAdmin.open(), dropdown.close()">Moderated</span> by <span class="hover:text-red-500">CrazyAl</span><br />
        Developed by <span class="hover:text-red-500">Danmer</span><br />
        <!-- Powered not by Diabotical API<br /> -->
        08.2021
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { inject, computed } from 'vue'
  import { config } from '../store/config'
  import { modalPlayer, modalAdmin } from '../store/ui'
  import { prettyDuration, nextValue } from '../utils'
  import { storage } from '../store/storage'

  const dropdown = inject('dropdown') as TDropdown
  const name = computed(() => storage.value.user.name)
  const flag = computed(() => storage.value.user.flag)
</script>
