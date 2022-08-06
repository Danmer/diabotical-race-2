<template>
  <div class="relative top-0 bottom-0 flex items-center px-2 py-2 cursor-pointer row" :class="{ 'sticky z-20 active ': player.active, 'sticky z-20 mine': player.mine, 'opacity-25': player.faded }" @click="togglePlayerFilter(player.id)">
    <i v-if="config.playerPhysics" class="flex-shrink-0 mr-2 text-gray-500 fa fa-fw" :class="`fa-${tagsById.get(player.bestPhysics)?.icon}`" :title="`Preferred physics: ${player.bestPhysics}`" />
    <UiPlayer class="mr-2" :player="player" />
    <a v-if="player.twitchName && (player.stream || token)" class="relative mr-2 text-xs text-gray-500 stream" :href="`https://twitch.tv/${player.twitchName}`" @click.stop target="_blank" rel="noopener">
      <i class="fa fa-video" :class="{ 'text-red-500': player.stream }" @mouseenter="hoveredStreamId = player.stream?.id || 0" @mouseleave="hoveredStreamId = 0" />
    </a>
    <div class="flex-1"></div>
    <div v-if="config.playersSort === 'Medals'" class="flex items-center flex-shrink-0 mr-2 -my-1 text-gray-400 text-2xs" title="Top3 Records">
      <div class="flex flex-col items-center w-6" :class="{ 'opacity-25': !player.medals[1] }" title="1 place"><i class="leading-4 text-yellow-300 fa fa-medal" />{{ player.medals[1] }}</div>
      <div class="flex flex-col items-center w-6" :class="{ 'opacity-25': !player.medals[2] }" title="2 place"><i class="leading-4 text-yellow-100 fa fa-medal" />{{ player.medals[2] }}</div>
      <div class="flex flex-col items-center w-6" :class="{ 'opacity-25': !player.medals[3] }" title="3 place"><i class="leading-4 text-yellow-500 fa fa-medal" />{{ player.medals[3] }}</div>
    </div>
    <div v-if="config.playersSort === 'Rating'" class="flex items-center flex-shrink-0 w-16" :title="player.rating.toFixed(3)">
      <i class="mr-1 text-xs text-yellow-300 fa fa-star" />
      {{ prettyNumber(Math.round(player.placement || player.rating)) }}
    </div>
    <a v-if="config.playersSort === 'Followers' && player.twitchName" class="flex items-center flex-shrink-0 w-16 text-gray-400" :href="`https://twitch.tv/${player.twitchName}`" @click.stop target="_blank" rel="noopener" title="Twitch followers">
      <img src="../assets/twitch.png" class="h-4 mr-1" />
      {{ prettyNumber(player.twitchFollowers) }}
    </a>
    <div v-if="config.playersSort === 'Maps' || config.playersSort === 'Runs'" class="flex items-center flex-shrink-0 w-14" title="Maps">
      <i class="mr-1 text-gray-500 fa fa-image" />
      {{ prettyNumber(player.maps.size) }}
    </div>
    <div class="flex-shrink-0 w-12" :title="runsTitle" :class="{ 'opacity-25': !player.records.size }">
      <i class="text-gray-500 fa fa-running" />
      {{ prettyNumber(player.records.size) }}
    </div>
    <i v-if="token" class="p-1 ml-1 -m-1 text-xs cursor-pointer fa fa-edit hover:text-gray-300" :class="player.epicId ? 'text-green-600 ' : 'text-gray-500 '" @click.prevent.stop="modalPlayer.open(player)" />
    <AppStreamPreview v-if="player.stream?.id === hoveredStreamId" />
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType } from 'vue'
  import { hoveredStreamId } from '../store'
  import { config } from '../store/config'
  import { tagsById } from '../store/data'
  import { token } from '../store/storage'
  import { modalPlayer } from '../store/ui'
  import { togglePlayerFilter } from '../store/filter'
  import { prettyNumber } from '../utils'
  import AppStreamPreview from './StreamPreview.vue'

  const props = defineProps({
    player: {
      type: Object as PropType<TPlayer>,
      required: true,
    },
  })

  const runsTitle = computed(() => 'Records: ' + prettyNumber(props.player.records.size) + '\nSubmissions: ' + prettyNumber(props.player.runs.size))

  //  :title="player.stream ? `LIVE: ${player.stream.title}` : ''"
</script>

<style scoped>
  /* .row .stream {
    opacity: 0;
  }
  .row:hover .stream {
    opacity: 1;
  } */
</style>
