<template>
  <div class="row-group" :class="{ collapsed: !collapser.active }">
    <div class="sticky top-0 bottom-0 z-40 flex items-center p-2 select-none">
      <a class="font-bold cursor-pointer" :class="day.active ? 'text-white' : 'text-blue-300 hover:text-blue-100'" :href="`?day=${day.id}`" @click.prevent="changeDayFilter(day.id)">
        {{ prettyDay(day.id) }}
      </a>
      <i v-if="token" class="p-1 ml-1 -m-1 text-xs text-gray-500 cursor-pointer hover:text-gray-100 fa fa-file-alt" @click.stop.prevent="createDayReport(day.id)" />
      <div class="flex items-center justify-end flex-1 text-sm text-gray-400 cursor-pointer hover:text-gray-50" :title="stats" @click="collapser.toggle()">
        <span>{{ visibleDayRuns.length !== day.runs.size ? visibleDayRuns.length + ' of ' : '' }}{{ day.runs.size }} run{{ day.runs.size === 1 ? '' : 's' }}</span>
        <i class="p-1 ml-1 -my-1 text-xs transition-transform opacity-50 fa fa-chevron-right" :class="{ 'rotate-90': collapser.active }" />
      </div>
    </div>
    <UiCollapser :collapser="collapser">
      <AppDayMap v-for="map in visibleDayMaps" :key="map.id" :map="map" />
      <AppDayRun v-for="run in visibleDayRuns" :key="run.id" :run="run" />
    </UiCollapser>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed, PropType, watch } from 'vue'
  import { daysCollapser } from '../store'
  import { filter, changeDayFilter } from '../store/filter'
  import { daysById } from '../store/data'
  import { token } from '../store/storage'
  import { compareStrings, includeString, prettyDay, createDayReport } from '../utils'
  import AppDayMap from './DayMap.vue'
  import AppDayRun from './DayRun.vue'

  const props = defineProps({
    day: {
      type: Object as PropType<TDay>,
      required: true,
    },
  })

  const collapser = reactive({ active: !daysCollapser.value } as TCollapser)

  const day = computed(() => daysById.value.get(props.day.id) as TDay)

  const visibleDayRuns = computed(() => {
    const dayRuns = [...day.value.runs.values()]
    const filteredDayRuns = dayRuns.filter((run) => !run.hidden)
    const sortedDayRuns = filteredDayRuns.sort((run1, run2) => compareStrings(run2.datetime || '', run1.datetime || ''))
    return sortedDayRuns
  })

  const visibleDayMaps = computed(() => {
    if (filter.playerId) {
      return []
    }
    const dayMaps = [...day.value.newMaps.values()]
    const filteredDayMaps = dayMaps.filter((map) => !map.hidden && includeString(map.name, filter.runsSearch))
    const sortedDayMaps = filteredDayMaps.sort((map1, map2) => compareStrings(map2.since, map1.since))
    return sortedDayMaps
  })

  const stats = computed(() => {
    return `${day.value.newMaps.size} new map${day.value.newMaps.size === 1 ? '' : 's'}\n${day.value.runs.size} run${day.value.runs.size === 1 ? '' : 's'}\non ${day.value.maps.size} map${day.value.maps.size === 1 ? '' : 's'}\nby ${day.value.players.size} player${day.value.players.size === 1 ? '' : 's'}`
  })

  watch(daysCollapser, (newValue) => {
    if (newValue === false) {
      collapser.open()
    }
    if (newValue === true) {
      collapser.close()
    }
  })
</script>

<style scoped>
  .row-group .fa-file-alt,
  .row-group .fa-images {
    opacity: 0;
  }

  .row-group:hover .fa-file-alt,
  .row-group:hover .fa-images {
    opacity: 1;
  }
</style>
