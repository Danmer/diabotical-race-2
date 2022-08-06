<template>
  <component :is="run.approved ? 'a' : 'div'" class="top-0 bottom-0 flex items-center w-full h-8 px-2 overflow-hidden row" :class="{ obsolete: run.obsolete, 'mine sticky z-10': run.mine, 'active sticky z-10': run.active }" :href="run.approved ? run.video : '#'" target="_blank" @click="openRun(run, $event)">
    <div class="flex items-center text-sm w-9 placement">
      <small v-if="run.placementDiff && config.lists === 'records'" class="w-4 text-center" :class="{ positive: run.placementDiff > 0, negative: run.placementDiff < 0 }">{{ Math.abs(run.placementDiff) }}</small>
      <small class="w-4 text-center text-gray-600" v-else>●</small>
      <div class="w-12 text-center">{{ index }}</div>
    </div>
    <div class="flex items-center flex-1 mx-1">
      <UiPlayer v-if="run.approved" :player="run.player" />
      <UiApproving v-else :run="run" class="flex items-center flex-1 mr-4 text-gray-400" />
    </div>
    <!-- <div class="flex items-center flex-1 space-x-2 text-xs">
      <div><span class="text-gray-500">k1 - </span>{{ run.k1 }}</div>
      <div><span class="text-gray-500">k2 - </span>{{ run.k2 }}</div>
      <div><span class="text-gray-500">pts - </span>{{ run.pts }}</div>
    </div> -->
    <div class="flex items-center mr-2 space-x-1">
      <i class="text-xs fa fa-fw" :class="`fa-${icon}`" v-for="(text, icon) in run.icons" :key="icon" :title="text" />
      <i v-if="run.wr" class="text-xs fa fa-fw fa-medal yellow" title="World record" />
    </div>
    <div v-if="config.playersSort === 'Rating'" class="mr-2 text-xs text-yellow-300" :title="run.ratingDiff.toFixed(3)">+{{ Math.round(run.ratingDiff) || 0 }}</div>
    <div class="mr-2 text-xs positive" v-if="run.new">
      {{ run.timeDiff ? (run.timeDiff / 1000).toFixed(3) : 'new' }}
    </div>
    <div>
      {{ prettyTime(run.time) }}
    </div>
    <div v-if="config.runDates" class="items-center justify-end hidden w-24 ml-1 text-sm text-gray-400 whitespace-pre sm:flex" :title="run.datetime">
      {{ prettyDate(run.datetime) }}
    </div>
    <i v-if="token" class="p-1 ml-1 -m-1 text-xs text-gray-500 cursor-pointer fa fa-edit hover:text-gray-300" @click.prevent.stop="modalRun.open(run)" />
  </component>
</template>

<script setup lang="ts">
  import { PropType } from 'vue'
  import { config } from '../store/config'
  import { token } from '../store/storage'
  import { modalRun } from '../store/ui'
  import { prettyDate, prettyTime, openRun } from '../utils'

  defineProps({
    run: {
      type: Object as PropType<TRun>,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
  })
</script>

<style scoped>
  .positive {
    color: #0c0;
  }
  .negative {
    color: #c00;
  }

  .placement .positive:before {
    content: '▲';
    display: block;
    line-height: 1.2;
  }
  .placement .negative:after {
    content: '▼';
    display: block;
    line-height: 1.2;
  }
</style>
