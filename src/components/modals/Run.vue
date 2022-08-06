<template>
  <div class="relative w-full max-w-md m-auto text-gray-100 transition-all duration-300 bg-gray-800 rounded-lg" @click.stop>
    <h3 class="mt-6 text-3xl font-extrabold leading-8 text-center">
      Run&nbsp;Submission<br />
      <span v-if="data.eggcup" class="text-xl text-yellow-300">for EGGCUP</span>
    </h3>

    <form class="flex flex-col p-6 space-y-6" :class="{ 'pointer-events-none opacity-25': success }">
      <fieldset v-if="!data.onlyRules" class="relative flex flex-col space-y-4">
        <div class="relative flex">
          <!-- Name -->
          <div class="relative flex-1">
            <UiSelect :select="nameSelect" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="name" spellcheck="false" required>
              <template v-slot:input-right>
                <span v-if="(!currentPlayer && nameSelect.value) || (currentPlayer?.runs.size === 1 && token)" class="p-1 text-[0.7em] uppercase font-bold text-green-500">new</span>
              </template>
              <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm text-white bg-gray-700" style="max-height: 17rem">
                <div v-for="player in autocompletedPlayers" :key="player.id" class="p-2 cursor-pointer row hover:bg-gray-900" @mousedown="selectPlayer(player)">
                  <UiPlayer :player="player" />
                </div>
              </UiList>
            </UiSelect>
          </div>

          <!-- Flag -->
          <div class="ml-2 w-28">
            <UiSelect :select="flagSelect" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="flag" spellcheck="false" @blur="flagSelect.value = !flagSelect.value || currentFlag ? flagSelect.value : flagSelect.backup">
              <template v-slot:input-right>
                <UiFlag class="text-xl shadow pointer-events-none" :country="flagSelect.value" />
              </template>
              <div class="relative flex flex-wrap justify-between p-2 overflow-y-scroll font-mono text-white bg-gray-700" style="max-height: 17rem">
                <div v-for="flag in autocompletedFlags" :key="flag" class="flex items-center min-w-[3.8rem] p-2 rounded cursor-pointer hover:bg-gray-900" @mousedown="flagSelect.set(flag)">
                  <UiFlag class="mr-1" :country="flag" />
                  {{ flag }}
                </div>
                <div v-for="i of 6" class="min-w-[3.8rem] px-2"></div>
              </div>
            </UiSelect>
          </div>
        </div>

        <div class="relative flex">
          <div class="relative flex-1">
            <!-- Map -->
            <UiSelect :select="mapSelect" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="map" spellcheck="false" :disabled="data.eggcup" required @blur="mapSelect.value = currentMap ? mapSelect.value : mapSelect.backup">
              <template v-slot:input-right>
                <UiThumbnail v-if="currentMap" :map="currentMap" class="w-16 h-8" />
              </template>
              <UiList :count="30" :animation="null" class="overflow-x-hidden overflow-y-scroll text-sm bg-gray-700" style="max-height: 14rem" @click="mapSelect.close()">
                <div v-for="map in autocompletedMaps" :key="map.id" class="flex items-center p-2 overflow-hidden cursor-pointer row hover:bg-gray-900" @mousedown="selectMap(map, map.physicsIds[0])">
                  <UiThumbnail class="w-16 h-8 mr-2 -my-1" :map="map" />
                  <div class="flex-1 -my-1 truncate">
                    {{ map.name }}
                    <div class="text-xs text-gray-400 !leading-4 truncate">by {{ map.authorNames.join(', ') }}</div>
                  </div>
                  <i v-for="[physicsId, physics] of physicsById" class="p-2 -my-2 text-gray-400 cursor-pointer fa hover:text-gray-100" :class="[map.physicsIds.includes(physicsId) ? '' : 'opacity-25', `fa-${tagsById.get(physics.id)?.icon}`]" :title="physicsId" @mousedown.stop="selectMap(map, physicsId)" />
                </div>
              </UiList>
            </UiSelect>
          </div>

          <!-- Version -->
          <div v-if="token" class="relative ml-2 w-14">
            <UiSelect :select="versionSelect" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="#" readonly required :disabled="!currentMap || data.eggcup" @blur="versionSelect.value = autocompletedVersions.includes(versionSelect.value) ? versionSelect.value : versionSelect.backup">
              <UiList v-if="currentMap" :count="30" :animation="null" class="overflow-y-scroll text-sm bg-gray-700" style="max-height: 14rem" @click="mapSelect.close()">
                <div v-for="version in autocompletedVersions" :key="version" class="flex items-center p-2 cursor-pointer row hover:bg-gray-900" @mousedown="versionSelect.set(version.toString())">
                  <span class="flex-1">{{ version }}</span>
                </div>
              </UiList>
            </UiSelect>
          </div>
        </div>

        <!-- Physics -->
        <div class="flex overflow-hidden text-sm font-bold uppercase divide-x divide-gray-900 rounded select-none divide-opacity-25">
          <div
            v-for="[physicsId, physicsData] of physicsById"
            :key="physicsId"
            class="flex items-center justify-center flex-auto p-3 overflow-hidden cursor-pointer hover:bg-gray-900"
            :class="[selectedPhysics === physicsId ? 'bg-gray-900 text-yellow-300' : 'bg-gray-700', { 'opacity-25': !currentMap?.physicsIds.includes(physicsId) }]"
            @click="selectedPhysics = physicsId"
          >
            <i class="hidden mr-3 -my-1 text-lg opacity-50 fa sm:inline-block" :class="`fa-${tagsById.get(physicsId)?.icon}`" />
            {{ physicsId }}
          </div>
        </div>

        <!-- Time -->
        <div class="relative">
          <UiInput :input="timeInput" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="time" required>
            <template v-slot:right>
              <span v-if="time > 99 && currentMap" class="text-sm font-bold">
                <span :class="timeDiff.pb <= 0 ? 'text-green-500' : 'text-red-500'" title="Personal best">
                  PB
                  <span v-if="timeDiff.pb" :class="{ plus: timeDiff.pb > 0 }">{{ (timeDiff.pb / 1000).toFixed(3) }}</span>
                </span>
                <span class="ml-2" :class="timeDiff.wr <= 0 ? 'text-green-500' : 'text-red-500'" title="World record">
                  WR
                  <span v-if="timeDiff.wr" :class="{ plus: timeDiff.wr > 0 }">{{ (timeDiff.wr / 1000).toFixed(3) }}</span>
                </span>
              </span>
            </template>
          </UiInput>
        </div>

        <!-- Video -->
        <div class="relative">
          <UiInput :input="videoInput" class="w-full px-3 py-2 pr-20 bg-gray-700 rounded focus:bg-gray-600" placeholder="video URL" required>
            <template v-slot:right>
              <a v-if="videoInput.value" :href="videoInput.value" target="_blank" class="text-sm font-bold text-blue-400 cursor-pointer hover:text-white" @click="openVideo(videoInput.value, $event)">preview</a>
            </template>
          </UiInput>
        </div>
      </fieldset>

      <!-- Icons -->
      <fieldset v-if="data.video" class="relative flex-1 px-2 pt-1 bg-gray-700 rounded cursor-text" :class="{ 'bg-gray-600': iconSelect.active }">
        <UiSelect :select="iconSelect" class="flex-1 p-1 mb-1 min-w-[4.5rem]" placeholder="icons" spellcheck="false" required @blur="iconSelect.clear()">
          <template v-slot:input-left>
            <div v-for="icon in selectedIcons" :key="icon" class="flex items-center p-2 mb-1 mr-1 text-sm bg-gray-800 rounded">
              <i class="mr-2 text-gray-600 fa" :class="`fa-${icon.split(':')[0]}`" />
              <span>{{ icon }}</span>
              <i class="p-1 ml-1 -m-1 text-gray-700 cursor-pointer hover:text-red-600 fa fa-times" @click="selectedIcons.delete(icon)" />
            </div>
          </template>
          <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm bg-gray-700" style="max-height: 14rem">
            <div class="relative">
              <div v-if="isNewIcon" key="new-icon" class="sticky top-0 flex items-center p-2 cursor-pointer row" @mousedown="addIcon(iconSelect.value)">
                <i class="mr-2 text-gray-500 fa" :class="`fa-${iconSelect.value.split(':')[0]}`" :title="iconSelect.value.split(':')[1]" />
                <span class="flex-1">{{ iconSelect.value }}</span>
                <span class="p-1 text-[0.7em] uppercase font-bold text-green-500">new</span>
              </div>
              <div v-for="icon in autocompletedIcons" :key="icon" class="flex items-center p-2 cursor-pointer row" @mousedown="addIcon(icon)">
                <i class="mr-2 text-gray-500 fa" :class="`fa-${icon.split(':')[0]}`" :title="icon.split(':')[1]" />
                <span>{{ icon }}</span>
              </div>
            </div>
          </UiList>
        </UiSelect>
      </fieldset>

      <div v-if="token && data.datetime" class="flex justify-between text-sm text-gray-500">
        <div>Submitted at {{ data.datetime.substring(11, 19) }}, {{ prettyDate(data.datetime.substring(0, 10)) }}</div>
        <div class="flex items-center font-bold cursor-pointer hover:text-gray-300" @click="verificationCollapser.toggle()">
          <i class="mr-1 fa" :class="data.verified === true ? 'fa-check-circle text-green-600' : data.verified === false ? 'fa-times-circle text-red-600' : 'fa-question-circle'"></i>
          {{ typeof data.verified === 'undefined' ? 'Verification' : 'Verified' }}
        </div>
      </div>

      <div v-if="token" class="!mt-0">
        <!-- Verification -->
        <UiCollapser :collapser="verificationCollapser">
          <!-- Preset ID -->
          <div class="relative mt-6">
            <UiSelect :select="presetSelect" class="w-full px-3 py-2 text-base bg-gray-700 rounded focus:bg-gray-600" placeholder="race preset" spellcheck="false" required>
              <template v-slot:input-right>
                <i class="fa fa-fw" :class="[`fa-${tagsById.get(currentPreset?.physics)?.icon}`, currentPreset?.physics === selectedPhysics ? 'text-green-500' : 'text-red-500', { 'fa-question-circle text-yellow-500': !currentPreset }]" />
              </template>
              <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm text-white bg-gray-700" style="max-height: 17rem">
                <div v-for="preset in presets" :key="preset.id" class="flex justify-between p-2 cursor-pointer row hover:bg-gray-900" :class="{ active: presetSelect.value === preset.id }" @mousedown="presetSelect.value = preset.id">
                  <span><i class="mr-1 text-gray-500 fa fa-fw" :class="`fa-${tagsById.get(preset.physics)?.icon}`" />{{ preset.name }}</span>
                  <span class="ml-4 text-xs text-gray-500">{{ preset.id.substr(0, 8) }}</span>
                </div>
              </UiList>
            </UiSelect>
          </div>
          <!-- User ID -->
          <div class="relative mt-2">
            <UiInput :input="userInput" class="w-full px-3 py-2 text-base bg-gray-700 rounded focus:bg-gray-600" placeholder="user id" required @vnode-mounted="!userInput.value && userInput.focus()">
              <template v-slot:right>
                <i class="fa fa-fw fa-user" :class="userInput.value.length > 5 ? 'text-green-500' : 'text-red-500'" />
              </template>
            </UiInput>
          </div>
          <!-- Token -->
          <div class="relative mt-2">
            <UiInput :input="tokenInput" class="w-full px-3 py-2 pr-20 text-base bg-gray-700 rounded focus:bg-gray-600" placeholder="token" required @vnode-mounted="userInput.value && tokenInput.focus()">
              <template v-slot:right>
                <a class="p-2 -m-1 text-sm font-bold text-blue-400 cursor-pointer hover:text-white" :href="verificationLink" target="_blank" @click.prevent="verify()">verify</a>
              </template>
            </UiInput>
          </div>
        </UiCollapser>
      </div>

      <!-- Rules -->

      <fieldset v-if="!data.video || data.onlyRules">
        <div v-if="data.onlyRules" class="flex">
          <div class="flex items-end flex-1 font-bold">Rules</div>
        </div>
        <div v-else class="flex">
          <div class="flex items-end flex-1">
            <label class="flex items-center font-bold cursor-pointer">
              <input class="w-5 h-5 mr-2 cursor-pointer" type="checkbox" v-model="agreeRunRules" />
              <span>I agree to the</span>
            </label>
            &nbsp;
            <span class="font-bold text-blue-300 border-b border-blue-300 border-dashed cursor-pointer hover:text-blue-400" @click="rulesCollapser.toggle()">rules</span>
          </div>
          <div class="justify-between hidden space-x-2 text-gray-700 sm:flex">
            <i class="fa fa-fw fa-id-card" title="name" />
            <i class="fa fa-fw fa-clock" title="timer" />
            <i class="fa fa-fw fa-tachometer-alt" title="speed" />
            <i class="fa fa-fw fa-keyboard" title="keys" />
            <i class="fa fa-fw fa-wifi" title="lagometer" />
          </div>
        </div>
        <UiCollapser v-if="runRules.length" :collapser="rulesCollapser">
          <ul class="pt-3 pb-1 pl-6 space-y-1 text-sm text-gray-400 whitespace-normal">
            <li class="list-disc" v-for="rule in runRules" :key="rule">{{ rule }}</li>
          </ul>
        </UiCollapser>
        <div class="mt-4 space-y-2 text-sm" v-if="currentMap && currentMap.rules.length">
          <div class="font-bold">Also on this map:</div>
          <ul class="pl-6 space-y-1 text-gray-400 whitespace-normal">
            <li class="list-disc" v-for="rule in currentMap.rules" :key="rule">{{ rule }}</li>
          </ul>
        </div>
        <div class="mt-4 space-y-2 text-sm" v-if="currentEggcup && currentEggcup.rules.length">
          <div class="font-bold">Also on this cup:</div>
          <ul class="pl-6 space-y-1 text-gray-400 whitespace-normal">
            <li class="list-disc" v-for="rule in currentEggcup.rules" :key="rule">
              {{ rule.replace(':preset_tooltip:', '') }}<span v-if="rule.includes(':preset_tooltip:')" class="ml-1"> (<a href="/img/preset.gif" class="text-blue-300 hover:text-white" target="_blank">how to use presets?</a>)</span>
            </li>
          </ul>
          <div class="flex items-center">
            <i class="mr-3 text-xl text-yellow-300 fa fa-fw fa-crow" title="race preset" />
            <UiInput :input="{ value: currentEggcup.presetRace }" class="flex-1 px-3 py-2 pr-8 font-mono bg-gray-700 rounded focus:bg-gray-600" placeholder="race preset" readonly>
              <template v-slot:right>
                <i class="p-1 ml-2 -m-1 cursor-pointer fa fa-copy hover:text-yellow-100" title="Copy" @click="copyAndHighlight(currentEggcup.presetRace, $event)" />
              </template>
            </UiInput>
          </div>
          <div class="flex items-center !mt-1">
            <i class="mr-3 text-xl text-yellow-300 fa fa-fw fa-fish" title="vintage preset" />
            <UiInput :input="{ value: currentEggcup.presetVintage }" class="flex-1 px-3 py-2 pr-8 font-mono bg-gray-700 rounded focus:bg-gray-600" placeholder="vintage preset" readonly>
              <template v-slot:right>
                <i class="p-1 ml-2 -m-1 cursor-pointer fa fa-copy hover:text-yellow-100" title="Copy" @click="copyAndHighlight(currentEggcup.presetVintage, $event)" />
              </template>
            </UiInput>
          </div>
          <div class="flex items-center !mt-1">
            <i class="mr-3 text-xl text-yellow-300 fa fa-fw fa-frog" title="diabotical preset" />
            <UiInput :input="{ value: currentEggcup.presetDiabotical }" class="flex-1 px-3 py-2 pr-8 font-mono bg-gray-700 rounded focus:bg-gray-600" placeholder="diabotical preset" readonly>
              <template v-slot:right>
                <i class="p-1 ml-2 -m-1 cursor-pointer fa fa-copy hover:text-yellow-100" title="Copy" @click="copyAndHighlight(currentEggcup.presetDiabotical, $event)" />
              </template>
            </UiInput>
            <!-- <div>{{ currentEggcup.preset }}</div> -->
          </div>
        </div>
      </fieldset>
    </form>

    <!-- Admin -->
    <div v-if="data.video && !data.onlyRules" class="p-6 pt-0">
      <div class="flex space-x-2 overflow-hidden">
        <div class="p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-red-800 to-red-900 hover:from-red-700" @click="deleteWithCofirm()"><i class="fa fa-fw fa-trash" /></div>
        <input v-model="replacer" type="text" class="w-48 px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="Reason of reject" />
        <template v-if="replacer">
          <div class="flex-1 p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-yellow-800 to-yellow-900 hover:from-yellow-700" @click="save()">Reject</div>
        </template>
        <template v-else>
          <div v-if="data.approved" class="flex-1 p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700" @click="save()">Save</div>
          <div v-else class="flex-1 p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700" @click="save()">Approve</div>
        </template>
      </div>
      <div class="mt-6 font-bold leading-6 text-center text-red-600 whitespace-normal -p-1" v-if="error">Error! {{ error }}</div>
    </div>

    <!-- Submit -->
    <div v-if="!data.video && !data.onlyRules" class="p-6 pt-0">
      <div class="relative p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700" v-if="!success" @click="submit()">
        {{ error ? 'Submit again' : 'Submit my run' }}
      </div>
      <div class="p-3 text-center" v-if="success">
        <p class="text-xl font-bold">Submitted!</p>
        <p class="mt-2 leading-6 text-gray-400 whitespace-normal"><span v-if="!data.eggcup">It's gonna be manually checked and approved soon. </span>Thank you for participating!</p>
        <p class="mt-4 cursor-pointer hover:text-yellow-200" @click="submitAnother()">Submit another one</p>
      </div>
      <div class="mt-3 font-bold leading-6 text-center text-red-600 whitespace-normal -p-1" v-if="error">Error! {{ error }}</div>
    </div>

    <div class="absolute top-0 right-0 p-1 m-2 text-2xl text-gray-500 cursor-pointer hover:text-red-600" @click="modalRun.close()">✖</div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, reactive, watch, watchEffect, nextTick } from 'vue'
  import { onKeyStroke } from '@vueuse/core'
  import { runRules, physicsById, maps, players, updateData, visiblePlayers, allRecordsByGroups, runs, icons, tagsById, eggcups, presets, playersById, mapsById } from '../../store/data'
  import { submitRun, deleteRun, saveRun, verifyAndSaveRun } from '../../api'
  import { runsUpdates } from '../../store'
  import { flags } from '../../store/dict'
  import { config } from '../../store/config'
  import { storage, token } from '../../store/storage'
  import { modalEggcup, modalRun, modalVideo } from '../../store/ui'
  import { compareStrings, openVideo, includeString, stringToMs, prettyTime, prettyDate, copyAndHighlight } from '../../utils'

  const data = modalRun.data || {}
  const success = ref(false)
  const error = ref('')

  const replacer = ref(data?.replacer || '')

  const predefinedIcons = Object.keys(data?.icons || {}).map((icon) => `${icon}:${data?.icons[icon]}`)
  const selectedIcons = ref(new Set<string>(predefinedIcons))

  const nameSelect = reactive({ value: data?.name || storage.value.user.name || '' } as TSelect)
  const flagSelect = reactive({ value: data?.flag || storage.value.user.flag || '', lowercase: true } as TSelect)
  const mapSelect = reactive({ value: mapsById.value.get(data?.mapId)?.name || '' } as TSelect)
  const versionSelect = reactive({ value: data?.version || '' } as TSelect)
  const selectedPhysics = ref(data?.physicsId || (config.defaultPhysics === 'auto' ? 'race' : config.defaultPhysics))
  const timeInput = reactive({ value: data?.time ? prettyTime(data.time) : '', mask: ['9.999', '99.999', '9:99.999', '99:99.999'] } as TInput)
  const videoInput = reactive({ value: data?.video || '' } as TInput)
  const iconSelect = reactive({ value: '' } as TSelect)

  const verificationCollapser = reactive({} as TCollapser) // active: data.eggcup && data.verified !== true && data.verified !== false
  const presetSelect = reactive({ value: '' } as TInput)
  const userInput = reactive({ value: '' } as TInput)
  const tokenInput = reactive({ value: '' } as TInput)

  const agreeRunRules = ref(storage.value.user.agreeRunRules)
  const rulesCollapser = reactive({ active: !storage.value.user.agreeRunRules || data.onlyRules } as TCollapser)

  // Computed

  const currentPlayer = computed(() => {
    return players.value.find((player) => player.name.toLowerCase() === nameSelect.value.toLowerCase() && player.flag === flagSelect.value)
  })

  const currentFlag = computed(() => {
    return flags.find((flag) => flag === flagSelect.value)
  })

  const currentMap = computed(() => {
    return maps.value.find((map) => map.name.toLowerCase() === mapSelect.value.toLowerCase())
  })

  const currentEggcup = computed(() => {
    return eggcups.value.find((eggcup) => eggcup.id === data.eggcup)
  })

  const currentPreset = computed(() => {
    return presets.value.find((preset) => preset.id === presetSelect.value)!
  })

  const newRun = computed(() => {
    return {
      mapId: currentMap.value?.id,
      version: +versionSelect.value,
      physicsId: selectedPhysics.value,
      flag: flagSelect.value,
      name: nameSelect.value,
      time: time.value,
      icons: [...selectedIcons.value.values()].reduce((icons, icon) => Object.assign(icons, { [icon.split(':')[0]]: icon.split(':')[1] }), {}),
      video: videoInput.value,
      eggcup: data.eggcup,
    } as Partial<TRun>
  })

  const time = computed(() => {
    return stringToMs(timeInput.value) || 0
  })

  const timeDiff = computed(() => {
    if (currentMap.value) {
      const recordsByPlayer = allRecordsByGroups.value.get(currentMap.value.id)?.get(currentMap.value.version)?.get(selectedPhysics.value) || new Map()
      const wr = [...recordsByPlayer.values()][0]
      const pb = recordsByPlayer.get(currentPlayer.value?.id)
      return {
        wr: wr ? time.value - wr.time : 0,
        pb: pb ? time.value - pb.time : 0,
      }
    }
    return {
      wr: 0,
      pb: 0,
    }
  })

  // Lists

  const autocompletedPlayers = computed(() => {
    const filteredPlayers = nameSelect.changed ? visiblePlayers.value.filter((player) => includeString(player.name, nameSelect.value)) : visiblePlayers.value
    const sortedPlayers = filteredPlayers.sort((a, b) => compareStrings(a.name, b.name))
    return sortedPlayers
  })

  const autocompletedFlags = computed(() => {
    const filteredFlags = flagSelect.changed ? flags.filter((flag) => flag.includes(flagSelect.value)) : flags
    const sortedFlags = filteredFlags.sort((a, b) => compareStrings(a, b))
    return sortedFlags
  })

  const autocompletedMaps = computed(() => {
    const activeMaps = maps.value.filter((map) => map.approved)
    const filteredMaps = mapSelect.changed ? activeMaps.filter((map) => includeString(map.id, mapSelect.value) || includeString(map.name, mapSelect.value)) : activeMaps
    const sortedMaps = filteredMaps.sort((a, b) => compareStrings(a.name, b.name))
    return sortedMaps
  })

  const autocompletedVersions = computed(() => {
    const versions = []
    for (let version = 1; version <= (currentMap.value?.version || 0); version++) {
      versions.push(version.toString())
    }
    return versions
  })

  const autocompletedIcons = computed(() => {
    const availableIcons = icons.value.filter((icon) => !selectedIcons.value.has(icon))
    const filteredIcons = iconSelect.changed ? availableIcons.filter((icon) => includeString(icon, iconSelect.value)) : availableIcons
    const sortedIcons = filteredIcons.sort((a, b) => compareStrings(a, b))
    return sortedIcons
  })

  const isNewIcon = computed(() => iconSelect.value && !icons.value.find((icon) => icon.toLowerCase() === iconSelect.value.toLowerCase()))

  const verificationLink = computed(() => {
    const runToken = tokenInput.value?.substring(0, 20)
    const epicShortId = userInput.value?.substring(0, 5)
    const presetId = currentPreset.value?.id.substring(0, 36)
    const mapId = currentMap.value?.id
    const runtime = time.value
    return `https://api.diabotical.com/api/v0/diabotical/app/verify_race_time/?preset_id=${presetId}&map=${mapId}&user_id=${epicShortId}&time=${runtime}&token=${runToken}`
  })

  // autocomplete player's name and flag
  watchEffect(() => {
    const player = players.value.find((player) => player.name.toLowerCase() === nameSelect.value.toLowerCase())
    if (player) {
      nameSelect.value = player.name
      flagSelect.value = player.flag
    } else {
      flagSelect.value = ''
    }
  })

  // autocomplete map's name and physics
  watchEffect(() => {
    const map = maps.value.find((map) => map.name.toLowerCase() === mapSelect.value.toLowerCase())
    if (map) {
      mapSelect.value = map.name
      if (!data.id) {
        versionSelect.value = map.version.toString()
      }
    }
  })

  // autofill verification preset
  watchEffect(() => {
    const physics = selectedPhysics.value
    const eggcup = currentEggcup.value
    const eggcupPreset = physics === 'race' ? eggcup?.presetRace : physics === 'vintage' ? eggcup?.presetVintage : eggcup?.presetDiabotical
    const defaultPreset = presets.value.find((preset) => preset.physics === physics)?.id
    presetSelect.value = eggcupPreset || defaultPreset || ''
  })

  // autofill verification user
  watchEffect(() => {
    const playerId = `${flagSelect.value}_${nameSelect.value}`.toLowerCase()
    userInput.value = playersById.value.get(playerId)?.epicId || ''
  })

  watch(agreeRunRules, (newValue) => {
    if (newValue) {
      rulesCollapser.close()
    } else {
      rulesCollapser.open()
    }
  })

  watch(newRun, () => {
    delete data.verified
  })

  onKeyStroke('Escape', () => {
    modalRun.close()
  })

  function selectPlayer(player: TPlayer) {
    nameSelect.set(player.name)
    flagSelect.set(player.flag)
  }

  function selectMap(map: TMap, physicsId?: TPhysicsId) {
    mapSelect.value = map.name
    nextTick(() => {
      selectedPhysics.value = physicsId
    })
  }

  function addIcon(icon: string) {
    selectedIcons.value.add(icon)
    iconSelect.clear()
  }

  function submitAnother() {
    success.value = false
    timeInput.value = ''
    videoInput.value = ''
    if (data.eggcup) {
      timeInput.focus()
    }
  }

  function validate() {
    error.value = ''
    if (!nameSelect.value) {
      error.value = 'You have to enter your nickname.'
      return
    }

    if (!currentMap.value?.id) {
      error.value = "You have to select your run's map."
      return
    }

    if (!time.value) {
      error.value = "You have to enter your run's time."
      return
    }

    if (!videoInput.value) {
      error.value = 'Paste a URL of your video.'
      return
    }

    const existedRun = runs.value.find((run) => run.video === videoInput.value)
    if (existedRun) {
      error.value = `This URL is already submitted\non ${prettyDate(existedRun.datetime)}.`
      return
    }

    if (!agreeRunRules.value) {
      error.value = 'You have to agree to the rules.'
      return
    }
  }

  function verify(presetId = '') {
    verifyAndSaveRun({ datetime: data.datetime, ...newRun.value }, userInput.value, presetSelect.value, tokenInput.value)
      .then((result) => {
        if (result !== null) {
          data.verified = result
          if (modalEggcup.active) {
            runsUpdates.emit()
          }
        }
      })
      .catch((err) => {
        error.value = err.message || err.value
      })
  }

  function submit() {
    validate()
    if (error.value) {
      return
    }
    // save player info
    Object.assign(storage.value.user, { name: nameSelect.value, flag: flagSelect.value, agreeRunRules: agreeRunRules.value })
    handleRequest(submitRun(newRun.value)).then((result) => {
      if (result) {
        success.value = true
      }
    })
  }

  function save() {
    handleRequest(saveRun({ replacer: replacer.value, ...newRun.value, datetime: data.datetime, approved: !replacer.value }))
  }

  function deleteWithCofirm() {
    if (window.confirm('Are you sure?')) {
      handleRequest(deleteRun({ datetime: data.datetime, eggcup: data.eggcup }))
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
          // close if the run was edited
          if (data.datetime) {
            modalVideo.close()
            modalRun.close()
          }
        }
        return res.success
      })
      .catch((err) => {
        error.value = err.message || err.value
      })
  }
</script>
