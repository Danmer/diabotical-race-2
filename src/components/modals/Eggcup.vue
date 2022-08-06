<template>
  <div class="relative w-full max-w-md m-auto text-lg text-gray-100 transition-all duration-300 bg-gray-800 rounded-lg" @click.stop>
    <h3 class="mt-6 text-3xl font-extrabold text-center">EGGCUP</h3>

    <form class="flex flex-col p-6 space-y-6">
      <!-- <div class="p-3 font-bold text-center text-yellow-100 bg-yellow-900 rounded">Only for map authors!</div> -->

      <fieldset class="flex flex-col space-y-4">
        <!-- Map -->
        <div class="relative">
          <UiSelect :select="mapSelect" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="map" :disabled="runs.length" spellcheck="false" required @blur="mapSelect.value = currentMap ? mapSelect.value : mapSelect.backup">
            <template v-slot:input-right>
              <UiThumbnail v-if="currentMap" :map="currentMap" class="w-16 h-8" />
            </template>
            <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm bg-gray-700" style="max-height: 14rem">
              <div v-for="map in autocompletedMaps" :key="map.id" class="flex items-center p-2 cursor-pointer row" @mousedown="selectMap(map.name)">
                <UiThumbnail class="w-16 h-8 mr-2 -my-1" :map="map" />
                <div class="flex-1 -my-1">
                  {{ map.name }}
                  <div class="mt-1 text-xs text-gray-400">by {{ map.authorNames.join(', ') }}</div>
                </div>
              </div>
            </UiList>
          </UiSelect>
        </div>

        <!-- Datetime -->
        <div class="relative flex w-full space-x-2">
          <UiInput :input="dateInput" class="flex-1 px-3 py-2 bg-gray-700 w-[11rem] sm:w-auto rounded focus:bg-gray-600" type="date" placeholder="date" />
          <UiInput :input="timeInput" class="flex-1 px-3 py-2 bg-gray-700 w-[9rem] sm:w-auto rounded focus:bg-gray-600" type="time" placeholder="time" />
        </div>
      </fieldset>
    </form>

    <div class="p-6 pt-0">
      <div class="flex overflow-hidden text-xs font-extrabold text-white uppercase divide-x divide-gray-900 rounded-t select-none bg-gray-900/25 divide-opacity-25">
        <div v-for="(runs, physicsId) in runsByPhysics" :key="physicsId" class="flex items-center justify-center flex-auto px-1 py-2 cursor-pointer hover:bg-gray-900" :class="{ 'bg-gray-900 text-yellow-300': currentPhysics === physicsId }" @click="selectedPhysics = physicsId">
          <!-- <i class="hidden mr-2 opacity-50 fa sm:block" :class="`fa-${tagsById.get(physicsId)?.icon}`"></i> -->
          {{ physicsId }} <span class="mx-1 opacity-50">-</span>{{ runs.length }}
        </div>
      </div>
      <div v-if="!runsByPhysics[currentPhysics].length" class="flex items-center justify-center min-h-[5rem] bg-gray-700">No submissions</div>
      <UiList v-else class="max-h-[14rem] min-h-[5rem] rounded-b bg-gray-700 overflow-y-auto">
        <a v-for="(run, index) in runsByPhysics[currentPhysics]" :key="run.video" class="top-0 bottom-0 flex items-center w-full h-8 px-2 overflow-hidden text-sm row" :href="run.video" target="_blank" @click="openRun(run, $event)">
          <div class="w-6 text-center placement">
            {{ index + 1 }}
          </div>
          <div class="flex items-center flex-1 mx-1 overflow-hidden">
            <UiPlayer class="py-1 -my-1 truncate" :player="{ flag: run.flag, name: run.name }" />
          </div>
          <div class="flex items-center mr-2 space-x-1">
            <i class="text-xs fa fa-fw" :class="`fa-${icon}`" v-for="(text, icon) in run.icons" :key="icon" :title="text" />
          </div>
          <div class="p-1 -m-1 hover:text-white" :class="run.verified === true ? 'text-green-400' : run.verified === false ? 'text-red-400' : ''" @click.stop.prevent="verify(run)">
            {{ prettyTime(run.time) }}
          </div>
          <div class="items-center justify-end hidden w-24 ml-1 text-gray-400 whitespace-pre sm:flex" :title="run.datetime">
            {{ prettyDate(run.datetime) }}
          </div>
          <!-- <div class="ml-2">
            <i class="fa fa-question-circle" @click.stop.prevent="modalRun.open({ ...run, eggcup: data, map: { name: currentMap?.name } })" />
          </div> -->
          <div class="ml-2">
            <i class="p-2 -m-2 fa fa-edit" :class="run.approved ? 'text-green-500' : run.replacer ? 'text-red-500' : ''" @click.stop.prevent="modalRun.open({ ...run, eggcup: data.id, mapId: currentMap?.id })" />
          </div>
        </a>
      </UiList>
      <div class="flex items-center justify-between mt-4 text-sm text-gray-500">
        <div class="cursor-pointer hover:text-gray-100" @click="createEggcupReport({ ...data, runs })">
          <i class="mr-1 fa fa-fw fa-file-alt" />
          Copy report
        </div>
        <div class="cursor-pointer hover:text-gray-100" @click="advancedCollapser.toggle()">
          <i class="mr-1 fa fa-tools" />
          Advanced settings
        </div>
      </div>
      <UiCollapser :collapser="advancedCollapser">
        <!-- <div class="mt-4">
          <textarea v-model.trim="rulesInput" class="w-full p-3 bg-gray-700 rounded focus:bg-gray-600" :rows="rulesInput.split('\n').length + 2" placeholder="extrarules" spellcheck="false"></textarea>
        </div> -->
        <div class="relative mt-4">
          <UiSelect :select="presetRaceSelect" class="w-full px-3 py-2 text-base bg-gray-700 rounded focus:bg-gray-600" placeholder="race preset" spellcheck="false" required @focus="presetRaceSelect.select()">
            <template v-slot:input-right>
              <i class="fa fa-crow" :class="presetRaceSelect.value && presetsById[presetRaceSelect.value]?.physics === 'race' ? 'text-green-500' : 'text-red-500'" />
            </template>
            <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm text-white bg-gray-700" style="max-height: 17rem">
              <div v-for="preset in presets" :key="preset.id" class="flex justify-between p-2 cursor-pointer row hover:bg-gray-900" :class="{ active: presetRaceSelect.value === preset.id }" @mousedown="presetRaceSelect.value = preset.id">
                <span><i class="mr-1 text-gray-500 fa fa-fw" :class="`fa-${tagsById.get(preset.physics)?.icon}`" />{{ preset.name }}</span>
                <span class="ml-4 text-xs text-gray-500">{{ preset.id.substr(0, 8) }}</span>
              </div>
            </UiList>
          </UiSelect>
        </div>
        <div class="relative mt-2">
          <UiSelect :select="presetVintageSelect" class="w-full px-3 py-2 text-base bg-gray-700 rounded focus:bg-gray-600" placeholder="vintage preset" spellcheck="false" required @focus="presetVintageSelect.select()">
            <template v-slot:input-right>
              <i class="fa fa-fish" :class="presetVintageSelect.value && presetsById[presetVintageSelect.value]?.physics === 'vintage' ? 'text-green-500' : 'text-red-500'" />
            </template>
            <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm text-white bg-gray-700" style="max-height: 17rem">
              <div v-for="preset in presets" :key="preset.id" class="flex justify-between p-2 cursor-pointer row hover:bg-gray-900" :class="{ active: presetVintageSelect.value === preset.id }" @mousedown="presetVintageSelect.value = preset.id">
                <span><i class="mr-1 text-gray-500 fa fa-fw" :class="`fa-${tagsById.get(preset.physics)?.icon}`" />{{ preset.name }}</span>
                <span class="ml-4 text-xs text-gray-500">{{ preset.id.substr(0, 8) }}</span>
              </div>
            </UiList>
          </UiSelect>
        </div>
        <div class="relative mt-2">
          <UiSelect :select="presetDiaboticalSelect" class="w-full px-3 py-2 text-base bg-gray-700 rounded focus:bg-gray-600" placeholder="diabotical preset" spellcheck="false" required @focus="presetDiaboticalSelect.select()">
            <template v-slot:input-right>
              <i class="fa fa-frog" :class="presetDiaboticalSelect.value && presetsById[presetDiaboticalSelect.value]?.physics === 'diabotical' ? 'text-green-500' : 'text-red-500'" />
            </template>
            <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm text-white bg-gray-700" style="max-height: 17rem">
              <div v-for="preset in presets" :key="preset.id" class="flex justify-between p-2 cursor-pointer row hover:bg-gray-900" :class="{ active: presetDiaboticalSelect.value === preset.id }" @mousedown="presetDiaboticalSelect.value = preset.id">
                <span><i class="mr-1 text-gray-500 fa fa-fw" :class="`fa-${tagsById.get(preset.physics)?.icon}`" />{{ preset.name }}</span>
                <span class="ml-4 text-xs text-gray-500">{{ preset.id.substr(0, 8) }}</span>
              </div>
            </UiList>
          </UiSelect>
        </div>
      </UiCollapser>
    </div>

    <!-- Admin -->
    <div class="p-6 pt-0">
      <div class="flex space-x-2">
        <!-- Delete -->
        <div class="p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-red-800 to-red-900 hover:from-red-700" :class="{ 'opacity-50 pointer-events-none': !data.id }" title="Delete Egg Cup" @click="deleteWithConfirm()"><i class="fa fa-fw fa-trash" /></div>
        <!-- Publish -->
        <div class="flex-auto p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700" :class="{ 'opacity-50 pointer-events-none': !data.runs.length }" @click="publishWithConfirm()">Publish runs</div>
        <!-- Save -->
        <div class="flex-auto p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700" :class="{ 'opacity-50 pointer-events-none': !mapSelect.value || !dateInput.value }" @click="save()">Save</div>
      </div>
      <div class="mt-6 font-bold leading-6 text-center text-red-600 whitespace-normal -p-1" v-if="error">Error! {{ error }}</div>
    </div>

    <div class="absolute top-0 right-0 p-1 m-2 text-2xl text-gray-500 cursor-pointer hover:text-red-600" @click="modalEggcup.close()">✖</div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, watchEffect, watch } from 'vue'
  import { onKeyStroke } from '@vueuse/core'
  import { runsUpdates } from '../../store'
  import { modalEggcup, modalRun, modalVideo } from '../../store/ui'
  import { mapsById, maps, updateData, eggcups, eggcupRules, playersById, tagsById, presets, presetsById } from '../../store/data'
  import { saveEggcup, publishEggcup, deleteEggcup, reviewEggcup, verifyAndSaveRun } from '../../api'
  import { compareStrings, includeString, prettyTime, prettyDate, openRun, createEggcupReport } from '../../utils'

  const data = (modalEggcup.data || { id: '', datetime: '', runs: [], rules: eggcupRules.value || [], presetRace: '', presetVintage: '', presetDiabotical: '' }) as TEggcup
  const error = ref('')

  const advancedCollapser = reactive({} as TCollapser)
  const presetRaceSelect = reactive({ value: data.presetRace || presets.value.find((preset) => preset.physics === 'race')?.id || '' } as TSelect)
  const presetVintageSelect = reactive({ value: data.presetVintage || presets.value.find((preset) => preset.physics === 'vintage')?.id || '' } as TSelect)
  const presetDiaboticalSelect = reactive({ value: data.presetDiabotical || presets.value.find((preset) => preset.physics === 'diabotical')?.id || '' } as TSelect)
  const rulesInput = ref(data.rules.join('\n'))

  const runs = ref<TRun[]>([])
  const selectedPhysics = ref('')

  const currentPhysics = computed(() => selectedPhysics.value || 'race')
  const runsByPhysics = computed<Record<string, TRun[]>>(() => {
    return {
      race: runs.value.filter((r) => r.physicsId === 'race').sort((run1, run2) => (run2.time > run1.time ? -1 : run2.time < run1.time ? 1 : run1.datetime > run2.datetime ? 1 : -1)),
      vintage: runs.value.filter((r) => r.physicsId === 'vintage').sort((run1, run2) => (run2.time > run1.time ? -1 : run2.time < run1.time ? 1 : run1.datetime > run2.datetime ? 1 : -1)),
      diabotical: runs.value.filter((r) => r.physicsId === 'diabotical').sort((run1, run2) => (run2.time > run1.time ? -1 : run2.time < run1.time ? 1 : run1.datetime > run2.datetime ? 1 : -1)),
    }
  })

  const mapSelect = reactive({ value: mapsById.value.get(data?.mapId)?.name || '' } as TSelect)
  const dateInput = reactive({ value: data?.datetime.substring(0, 10) || '' } as TInput)
  const timeInput = reactive({ value: data?.datetime.substring(11, 16) || '00:00' } as TInput)

  // Computed

  const currentMap = computed(() => {
    return maps.value.find((map) => map.name.toLowerCase() === mapSelect.value.toLowerCase())
  })

  const newEggcup = computed(() => {
    return {
      id: data.id,
      mapId: currentMap.value?.id,
      datetime: `${dateInput.value}T${timeInput.value}:00.000Z`,
      presetRace: presetRaceSelect.value,
      presetVintage: presetVintageSelect.value,
      presetDiabotical: presetDiaboticalSelect.value,
      rules: rulesInput.value ? rulesInput.value.split('\n') : [],
    } as Partial<TEggcup>
  })

  // Lists

  const autocompletedMaps = computed(() => {
    const activeMaps = maps.value.filter((map) => map.approved)
    const filteredMaps = mapSelect.changed ? activeMaps.filter((map) => includeString(map.id, mapSelect.value) || includeString(map.name, mapSelect.value)) : activeMaps
    const sortedMaps = filteredMaps.sort((a, b) => compareStrings(a.name, b.name))
    return sortedMaps
  })

  // autocomplete map's name and physics
  watchEffect(() => {
    const map = maps.value.find((map) => map.name.toLowerCase() === mapSelect.value.toLowerCase())
    if (map) {
      mapSelect.value = map.name
    }
  })

  onKeyStroke('Escape', () => {
    if (!modalRun.active && !modalVideo.active) {
      modalEggcup.close()
    }
  })

  runsUpdates.on(() => {
    updateEggcup()
  })

  if (data.id) {
    watch(eggcups, updateEggcup, { immediate: true })
  }

  function updateEggcup() {
    reviewEggcup(data.id).then((data) => {
      runs.value = data.eggcup.runs
    })
  }

  function selectMap(mapName: string) {
    mapSelect.set(mapName)
  }

  function verify(run: Partial<TRun>) {
    const playerId = `${run.flag}_${run.name}`.toLowerCase()
    const player = playersById.value.get(playerId) || { epicId: '' }
    const presetId = run.physicsId === 'race' ? newEggcup.value.presetRace : run.physicsId === 'vintage' ? newEggcup.value.presetVintage : run.physicsId === 'diabotical' ? newEggcup.value.presetDiabotical : ''
    verifyAndSaveRun(run, player.epicId, presetId).then((result) => {
      updateEggcup()
    })
  }

  function save() {
    handleRequest(saveEggcup(newEggcup.value))
  }

  function publishWithConfirm() {
    if (window.confirm('All runs will be published. Are you sure?')) {
      handleRequest(publishEggcup(data.id))
    }
  }

  function deleteWithConfirm() {
    if (window.confirm('Egg Cup will be deleted! Are you sure?')) {
      handleRequest(deleteEggcup(data.id))
    }
  }

  function handleRequest(request: Promise<{ success?: boolean; error?: string }>) {
    error.value = ''
    return request
      .then((res) => {
        if (res.error) {
          throw Error(res.error)
        }
        if (res.success) {
          updateData()
          modalEggcup.close()
        }
        return res.success
      })
      .catch((err) => {
        error.value = err.message || err.value
      })
  }
</script>
