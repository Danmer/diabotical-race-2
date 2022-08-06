<template>
  <div class="relative flex flex-col overflow-hidden rounded shadow map" :class="{ 'opacity-20': map.faded, archived: map.until }">
    <figure class="relative px-3 bg-gray-900" :class="config.mapTags ? 'py-8' : 'py-10'">
      <!-- Image -->
      <Thumbnail v-if="config.mapThumbnails" class="absolute inset-0 bg-center bg-cover" :map="map" />

      <!-- Shadow -->
      <div class="absolute inset-0 thumbnail-shadows"></div>

      <div class="relative flex flex-col items-start space-y-2">
        <!-- Name -->
        <figcaption class="flex items-center -my-1 text-2xl font-bold text-white" :title="map.name">
          <div class="flex-1 leading-8 max-w-[16rem] truncate text-shadow">{{ map.name }}</div>
          <i class="p-1 ml-2 -m-1 text-base cursor-pointer fa fa-copy hover:text-yellow-100" title="Copy name" @click="copyAndHighlight(map.name, $event)" />
          <i v-if="token" class="p-1 ml-2 -m-1 text-base cursor-pointer fa fa-edit hover:text-yellow-100" @click.prevent.stop="modalMap.open(map)" />
        </figcaption>

        <!-- ID -->
        <div class="text-sm text-gray-300" v-if="config.mapIds">
          {{ map.id }}
        </div>

        <!-- Authors -->
        <div class="text-sm font-bold text-gray-400 text-shadow">
          <div v-if="map.authors.size">
            by
            <span class="author" v-for="[authorId, author] in map.authors" :key="author.id">
              <span class="cursor-pointer hover:text-white" @click="addAuthorFilter(author.id)">{{ author.name }}</span>
            </span>
          </div>
          <div v-else>by unknow authors</div>
        </div>

        <!-- Tags -->
        <div v-if="config.mapTags" class="flex flex-wrap items-center h-6 -ml-1 text-xs font-bold text-white" style="text-shadow: none">
          <span v-for="tag in visibleTags" :key="tag.id" class="relative px-2 py-1 mb-1 ml-1 bg-gray-600 rounded shadow cursor-pointer tag" :style="{ backgroundColor: tag.color }" @click="addTagFilter(tag.id)">
            {{ tag.name }}
          </span>
        </div>
      </div>

      <!-- Filters -->
      <div class="absolute transition-opacity top-2 right-2 map-filters">
        <div class="space-y-2 text-sm font-bold text-right select-none">
          <!-- Versions -->
          <div class="flex" v-if="map.version > 1">
            <div v-for="version in map.version" :key="version" class="p-1 opacity-75 cursor-pointer hover:opacity-100" :class="{ 'opacity-100 text-yellow-400': currentVersion === +version }" :title="`Version ${version}`" @click="selectedVersion = +version">
              {{ version }}
            </div>
          </div>

          <!-- Icons -->
          <div class="flex justify-end">
            <div v-for="(title, icon) in map.icons" class="p-1 opacity-75 cursor-pointer hover:opacity-100" :class="{ 'opacity-100 text-green-500': iconsFilter.get(icon) === true, 'opacity-100 text-red-500': iconsFilter.get(icon) === false }" @mousedown="toggleIcon(icon)">
              <i class="fa" :class="`fa-${icon.split(' ')[0]}`" :title="iconsFilter.get(icon) === true ? `including '${title}'` : iconsFilter.get(icon) === false ? `excluding '${title}'` : `filter by ${title}`" />
            </div>
          </div>
        </div>
      </div>

      <!-- Date-->
      <div class="absolute flex flex-col items-end text-xs bottom-3 right-3">
        <div v-if="config.mapDates || map.until" class="text-gray-400">
          <i v-if="map.until" class="mr-1 fa fa-monument" />{{ prettyDate(map.since) }}<span v-if="map.until"> &ndash; {{ prettyDate(map.until) }}</span>
        </div>
      </div>
    </figure>

    <div class="flex text-xs font-extrabold text-white uppercase bg-gray-800 divide-x divide-gray-900 select-none divide-opacity-25">
      <div v-for="physicsId in map.physicsIds" :key="physicsId" class="flex items-center justify-center flex-auto px-1 py-3 cursor-pointer hover:bg-gray-900" :class="{ 'bg-gray-900 text-yellow-300': currentPhysics === physicsId }" @click="selectedPhysics = physicsId">
        <i class="mr-2 fa fa-check text-2xs" :class="currentRunsByPhysics.get(physicsId)?.has(filter.playerId) ? 'text-blue-500' : !filter.playerId && currentRunsByPhysics.get(physicsId)?.has(userId) ? 'text-green-500' : 'text-gray-600'" />
        {{ physicsId }} <span class="mx-1 opacity-50">-</span>{{ currentRunsByPhysics.get(physicsId)?.size }}
      </div>
    </div>

    <div v-if="config.runsCount" class="overflow-auto bg-gray-700" :class="{ ' transition-all': config.animation }" :style="{ height: config.runsCount * 2 + 'rem' }">
      <UiList v-if="visibleRuns.length" ref="listComponent" class="h-full overflow-y-scroll" :count="config.runsCount * 2" @scroll.prevent>
        <AppMapRun :run="run" :index="index + 1" v-for="(run, index) in visibleRuns" :key="run.id" />
      </UiList>
      <div v-else class="flex flex-col items-center justify-center h-full text-xl font-bold text-gray-400" key="empty">
        No submissions
        <div v-show="!map.tags.has('archived') && currentVersion === map.version && config.runsCount > 1" class="mt-2 text-sm text-gray-500">Your run will be a world record!</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch, PropType, reactive } from 'vue'
  import { physicsSwitcher } from '../store'
  import { config } from '../store/config'
  import { userId, token } from '../store/storage'
  import { filter, addTagFilter, addAuthorFilter } from '../store/filter'
  import { modalMap } from '../store/ui'
  import { copyAndHighlight, prettyDate, prettyTime } from '../utils'
  import { getDefaultMapPhysics, recordsByGroups, runsByGroups } from '../store/data'
  import AppMapRun from './MapRun.vue'
  import Thumbnail from './ui/Thumbnail.vue'

  const props = defineProps({
    map: {
      type: Object as PropType<TMap>,
      required: true,
    },
  })

  const listComponent = ref()

  const iconsFilter = reactive(new Map<string, boolean>())
  const selectedVersion = ref(0)
  const selectedPhysics = ref<TPhysicsId | ''>('')

  const currentVersion = computed(() => selectedVersion.value || props.map.version)

  const currentPhysics = computed(() => selectedPhysics.value || getDefaultMapPhysics(props.map))

  const currentRunsByPhysics = computed(() => (config.lists === 'records' ? recordsByGroups.value : runsByGroups.value).get(props.map.id)?.get(currentVersion.value) || new Map()) // or runsByGroups for all runs

  const currentRuns = computed(() => [...currentRunsByPhysics.value.get(currentPhysics.value).values()])

  const visibleRuns = computed(() => {
    return currentRuns.value.filter((run) => {
      for (const [icon, value] of iconsFilter) {
        if ((run.icons[icon] && !value) || (!run.icons[icon] && value)) {
          return false
        }
      }
      return true
    })
  })

  const visibleTags = computed(() => {
    return [...props.map.tags.values()].filter((tag) => tag.group !== 3 && tag.group !== 6).sort((a, b) => a.group - b.group)
  })

  watch([selectedPhysics, () => filter.dayId, () => filter.tagIds, () => filter.authorIds], () => {
    if (listComponent.value) {
      // listComponent.value.page = 1
      listComponent.value.scrollToTop()
    }
  })

  watch(physicsSwitcher, (newPhysics) => {
    nextTick(() => {
      if (newPhysics && props.map.physicsIds.includes(newPhysics)) {
        selectedPhysics.value = newPhysics
      }
      nextTick(() => {
        physicsSwitcher.value = ''
      })
    })
  })

  function toggleIcon(icon: string) {
    if (iconsFilter.has(icon)) {
      if (iconsFilter.get(icon)) {
        iconsFilter.delete(icon)
      } else {
        iconsFilter.set(icon, true)
      }
    } else {
      iconsFilter.set(icon, false)
    }
  }
</script>

<style scoped>
  .archived {
    filter: grayscale(0.8);
  }
  .author:not(:last-child):after {
    content: ', ';
  }

  figcaption .fa-edit,
  figcaption .fa-copy {
    opacity: 0;
  }
  figcaption:hover .fa-edit,
  figcaption:hover .fa-copy {
    opacity: 1;
  }

  /* .map .map-filters {
    opacity: 0;
  }
  .map:hover .map-filters {
    opacity: 1;
  } */
</style>
