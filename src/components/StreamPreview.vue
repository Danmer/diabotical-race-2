<template>
  <div v-if="stream" class="absolute text-xs bg-gray-800 border border-gray-900 shadow-xl top-full left-1/2 -translate-x-1/2 w-[90%] aspect-video z-10">
    <!-- Image -->
    <img class="w-full h-full" :src="`${stream.preview}`" />
    <div class="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

    <!-- LIVE -->
    <div class="absolute top-0 left-0 m-2 space-y-1">
      <div class="flex items-center">
        <i class="fa fa-circle mr-1 text-red-600" />
        <div class="text-shadow">{{ duration }}</div>
      </div>
      <div class="flex items-center" :title="`Delay ${stream.delay} seconds`" v-if="stream.delay">
        <i class="fa fa-clock mr-1" />
        <div>{{ stream.delay }}s</div>
      </div>
    </div>

    <!-- Users -->
    <div class="absolute top-0 right-0 m-2 space-y-1 text-right font-bold">
      <div class="flex items-center"><i class="fa fa-user mr-1" />{{ viewers }}</div>
      <!-- <div class="text-gray-500" v-if="stream.quality">{{ stream.quality }}p</div> -->
    </div>

    <!-- Title -->
    <div class="absolute bottom-0 inset-x-0 m-2 flex items-end font-bold whitespace-normal" :title="stream.title">
      <!-- <span class="p-1 flex items-center rounded bg-red-600 text-white">LIVE</span> -->
      <!-- <i class="fa fa-circle mr-1 animate-pulse text-red-600" /> -->
      <div class="flex-1">{{ stream.title }}</div>
      <img class="ml-1 rounded-sm" width="20" height="20" :src="stream.channel.logo" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { hoveredStreamId, now } from '../store'
  import { streamsById } from '../store/streams'
  import { prettyTime, prettyNumber } from '../utils'

  const stream = computed(() => streamsById.value.get(hoveredStreamId.value)!)
  const viewers = computed(() => prettyNumber(stream.value.viewers))
  const duration = computed(() => prettyTime(new Date(now.value).getTime() - new Date(stream.value?.startedAt).getTime(), { ms: false }))
</script>
