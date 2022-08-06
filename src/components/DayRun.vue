<template>
  <component
    :is="run.approved || token ? 'a' : 'div'"
    class="relative flex items-center w-full h-8 p-2 leading-4 bg-left bg-cover row"
    :class="{ mine: run.mine }"
    :style="config.runThumbnails ? { backgroundImage: `url(${run.map.image})`, backgroundBlendMode: 'soft-light' } : {}"
    :href="run.approved || token ? run.video : null"
    target="_blank"
    rel="noopener"
    @click="openRun(run, $event)"
  >
    <!-- <UiThumbnail v-if="config.runThumbnails" :map="run.map" class="w-12 h-6 mr-2 -my-3" /> -->
    <UiPlayer v-if="run.approved" class="flex-1 min-w-[4rem] mr-4" :player="run.player" />
    <UiApproving v-else :run="run" class="flex items-center flex-1 mr-4 text-gray-400" />
    <div class="mr-1" v-if="run.icons">
      <i class="mr-1 text-xs fa fa-fw" :class="`fa-${icon}`" v-for="(text, icon) in run.icons" :key="icon" :title="text" />
      <i v-if="run.wr" class="text-xs fa fa-fw fa-medal yellow" title="World record" />
    </div>
    <div class="mr-1 text-sm text-gray-400 max-w-[4rem] text-right overflow-hidden">
      <div class="truncate" :title="run.map.name">{{ run.map.name }}</div>
    </div>
    <div v-if="run.version !== run.map.version" class="flex-shrink-0 mr-1 text-gray-400" :title="run.physicsId">[{{ run.version }}]</div>
    <div class="flex-shrink-0 mr-2 text-gray-400" :title="run.physicsId">[{{ run.physicsId.substring(0, 1) }}]</div>
    <div class="flex items-center flex-shrink-0" :title="title">
      {{ prettyTime(run.time) }}
      <!-- <span class="ml-1 text-xs text-gray-500">{{ run.timeDiff < 0 ? '' : '+' }}{{ (run.timeDiff / 1000).toFixed(3) }}</span> -->
    </div>
    <i v-if="token" class="p-1 ml-1 -m-1 text-xs text-gray-500 cursor-pointer fa fa-edit hover:text-gray-100" @click.prevent.stop="modalRun.open(run)" />
  </component>
</template>

<script setup lang="ts">
  import { computed, PropType } from 'vue'
  import { config } from '../store/config'
  import { token } from '../store/storage'
  import { runsByGroups } from '../store/data'
  import { modalRun } from '../store/ui'
  import { prettyTime, openRun } from '../utils'

  const props = defineProps({
    run: {
      type: Object as PropType<TRun>,
      required: true,
    },
  })

  const title = computed(() => {
    const runs = [...(runsByGroups.value.get(props.run.mapId)?.get(props.run.version)?.get(props.run.physicsId)?.values() || [])]
    const wr = (props.run.wr ? runs[1] : runs[0]) || { time: 0 }

    const wrDiff = props.run.time - wr.time
    const pbTitle = `PB ` + (props.run.timeDiff ? prettyTime(props.run.timeDiff) : '')
    const wrTitle = wrDiff && runs.length > 1 ? `WR ${(wrDiff > 0 ? '+' : '') + prettyTime(wrDiff)}` : 'WR'
    return pbTitle + '\n' + wrTitle
  })
</script>
