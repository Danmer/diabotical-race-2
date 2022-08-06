<template>
  <div class="relative overflow-y-scroll shadow">
    <UiThumbnail :map="map" class="absolute inset-0 w-full h-full" />
    <div class="absolute inset-0 thumbnail-shadows"></div>

    <div class="relative flex flex-col items-start p-3 space-y-2">
      <div class="flex items-center justify-between w-full pb-2">
        <div class="text-2xl font-bold text-yellow-200">LEAGUE</div>
        <div class="text-lg font-bold">{{ prettyDate(cup.datetime) }}</div>
      </div>

      <div class="w-full h-[2px] bg-gradient-to-r from-transparent via-[#fff9] to-transparent"></div>

      <div></div>

      <!-- Name -->
      <figcaption class="w-full text-center text-2xl font-bold text-white hover:text-yellow-100 leading-8 max-w-[18rem] truncate cursor-pointer">Brand New Map</figcaption>

      <!-- Authors -->
      <div class="w-full text-sm font-bold text-center text-gray-400 whitespace-normal">
        <div>every round</div>
      </div>

      <div></div>

      <div class="w-full h-[2px] bg-gradient-to-r from-transparent via-[#fff9] to-transparent"></div>

      <div class="relative flex items-center justify-between w-full pt-2">
        <div></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed, PropType } from 'vue'
  import { config } from '../store/config'
  import { mapsById } from '../store/data'
  import { filter } from '../store/filter'
  import { prettyDate } from '../utils'

  export default defineComponent({
    name: 'AppLeague',
    props: {
      cup: {
        type: Object as PropType<TEggcup>,
        required: true,
      },
    },
    setup(props) {
      const map = computed(() => mapsById.value.get(props.cup.mapId) as TMap)

      return {
        config,
        filter,
        map,
        prettyDate,
      }
    },
  })
</script>
