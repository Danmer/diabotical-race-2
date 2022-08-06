<template>
  <div v-if="map" class="relative overflow-y-scroll shadow-top">
    <UiThumbnail :map="map" class="absolute inset-0 w-full h-full" />
    <div class="absolute inset-0 thumbnail-shadows"></div>

    <div class="relative flex flex-col items-start p-3 space-y-3">
      <div class="flex items-center justify-between w-full">
        <div class="text-2xl font-bold text-yellow-200">EGGCUP</div>
        <div class="text-lg font-bold">{{ timeAgo ? timeAgo.replace('1D', '1 day, ').replace('D', ' days, ') : prettyDate(eggcup.datetime) }}</div>
      </div>

      <!-- Name -->
      <div class="w-full py-3 bg-gradient-to-r from-transparent via-black/75 to-transparent text-shadow">
        <!-- <div class="w-full mb-2 h-[2px] bg-gradient-to-r from-transparent via-[#fff9] to-transparent"></div> -->

        <figcaption class="w-full text-center text-2xl font-bold text-white hover:text-yellow-100 !leading-8 max-w-[18rem] truncate cursor-pointer" :title="map.name" @click="filter.mapsSearch = map.name">
          {{ map.name }}
        </figcaption>

        <!-- Authors -->
        <div class="w-full !leading-5 text-sm font-bold text-center text-gray-400 whitespace-normal">
          <div v-if="map.authors.size">
            by
            <span class="author" v-for="[authorId, author] in map.authors" :key="author.id">
              {{ author.name }}
            </span>
          </div>
          <div v-else>by unknow authors</div>
        </div>

        <!-- <div class="w-full mt-2 h-[2px] bg-gradient-to-r from-transparent via-[#fff9] to-transparent"></div> -->
      </div>

      <div class="relative flex items-center justify-between w-full space-x-1">
        <!-- Submit -->
        <div class="relative px-3 py-2 font-bold text-center uppercase rounded cursor-pointer bg-gradient-to-br to-gray-900 hover:from-green-600" :class="timeAgo ? 'from-green-700' : 'from-gray-600 pointer-events-none'" @click="modalRun.open({ mapId: map.id, eggcup: eggcup.id })">{{ timeAgo ? 'Submit run' : 'Closed' }}</div>
        <!-- Edit -->
        <div v-if="token" class="p-2 font-bold text-center uppercase rounded cursor-pointer select-none bg-gradient-to-br from-blue-800 to-gray-900 hover:from-blue-700" @click="modalEggcup.open(eggcup)">
          <i class="fa fa-edit" />
        </div>
        <!-- Rules -->
        <i v-if="!token" class="text-xl text-yellow-400 cursor-pointer select-none fa fa-fw fa-exclamation-circle hover:text-yellow-200" @click="modalRun.open({ mapId: map.id, eggcup: eggcup.id, onlyRules: true })"></i>
        <div class="flex-1 text-right">
          <!-- <div class="text-yellow-100 cursor-pointer hover:text-yellow-400" @click="modalRun.open({ mapId: map.id, eggcup, onlyRules: true })">Rules</div> -->
          <div>{{ eggcup?.runs?.length }} submission{{ eggcup?.runs?.length > 1 ? 's' : '' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType } from 'vue'
  import { mapsById } from '../store/data'
  import { now } from '../store/index'
  import { token } from '../store/storage'
  import { filter } from '../store/filter'
  import { modalRun, modalEggcup } from '../store/ui'
  import { prettyTime, prettyDate } from '../utils'

  const props = defineProps({
    eggcup: {
      type: Object as PropType<TEggcup>,
      required: true,
    },
  })

  const map = computed(() => mapsById.value.get(props.eggcup.mapId) as TMap)

  // map.tagNames.sort((t1, t2) => t1.length - t2.length)

  const timeAgo = computed(() => {
    const since = new Date(now.value).getTime()
    const until = new Date(props.eggcup.datetime).getTime()
    return since < until ? prettyTime(until - since, { ms: false }) : ''
  })
</script>

<style scoped>
  .author + .author:before {
    content: ', ';
  }
</style>
