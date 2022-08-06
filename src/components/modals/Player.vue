<template>
  <div class="relative w-full max-w-md m-auto text-lg text-gray-100 transition-all duration-300 bg-gray-800 rounded-lg">
    <h3 class="mt-6 text-3xl font-extrabold leading-8 text-center">User</h3>

    <form class="flex flex-col p-6 space-y-6" @submit.prevent="submit()">
      <fieldset class="relative flex flex-col space-y-4">
        <div class="relative flex">
          <!-- Name -->
          <div class="relative flex-1">
            <UiSelect :select="nameSelect" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="name" spellcheck="false" :disabled="data.id" required>
              <template v-slot:input-right>
                <span v-if="!currentPlayer && nameSelect.value" class="p-1 text-[0.7em] uppercase font-bold text-green-500">new</span>
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
            <UiSelect :select="flagSelect" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="flag" spellcheck="false" :disabled="data.id" @blur="flagSelect.value = !flagSelect.value || currentFlag ? flagSelect.value : flagSelect.backup">
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
      </fieldset>

      <fieldset v-if="data.id">
        <!-- Epic ID -->
        <div class="relative flex-1">
          <UiInput :input="idInput" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="Epic ID" spellcheck="false" />
        </div>
      </fieldset>

      <fieldset v-if="data.id">
        <!-- Stream -->
        <div class="relative flex-1">
          <UiInput :input="streamInput" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="Twitch channel" spellcheck="false" />
        </div>
      </fieldset>

      <fieldset class="flex space-x-2">
        <div v-if="!data.id" class="px-6 py-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-red-800 to-red-900 hover:from-red-700" @click.stop.prevent="forget(), close()">Reset</div>
        <button class="flex-1 p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700" @click.stop.prevent="submit(), close()">Save</button>
      </fieldset>
    </form>
    <div class="absolute top-0 right-0 p-1 m-2 text-2xl text-gray-500 cursor-pointer hover:text-red-600" @click="close()">✖</div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed, watchEffect, triggerRef } from 'vue'
  import { onKeyStroke } from '@vueuse/core'
  import { visiblePlayers, players, updateData } from '../../store/data'
  import { flags } from '../../store/dict'
  import { savePlayer } from '../../api'
  import { modalPlayer } from '../../store/ui'
  import { storage } from '../../store/storage'
  import { compareStrings, includeString } from '../../utils'

  const data = modalPlayer.data || {}

  const nameSelect = reactive({ value: data.id ? data.name : storage.value.user.name || '' } as TSelect)
  const flagSelect = reactive({ value: data.id ? data.flag : storage.value.user.flag || '', lowercase: true } as TSelect)
  const idInput = reactive({ value: data.epicId || '' } as TInput)
  const streamInput = reactive({ value: data.twitchName || '' } as TInput)

  // Computed

  const currentPlayer = computed(() => {
    return players.value.find((player) => player.name.toLowerCase() === nameSelect.value.toLowerCase() && player.flag === flagSelect.value)
  })

  const currentFlag = computed(() => {
    return flags.find((flag) => flag === flagSelect.value)
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

  onKeyStroke('Escape', () => {
    modalPlayer.close()
  })

  function selectPlayer(player: TPlayer) {
    nameSelect.set(player.name)
    flagSelect.set(player.flag)
  }

  function submit() {
    if (data.id) {
      savePlayer({
        name: nameSelect.value,
        flag: flagSelect.value,
        epicId: idInput.value,
        twitchName: streamInput.value,
      }).then(() => {
        updateData()
      })
    } else {
      storage.value.user.name = nameSelect.value
      storage.value.user.flag = flagSelect.value
    }
  }

  function forget() {
    storage.value.user.name = ''
    storage.value.user.flag = ''
    triggerRef(storage)
  }

  function close() {
    modalPlayer.close()
  }
</script>
