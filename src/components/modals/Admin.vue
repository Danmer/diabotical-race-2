<template>
  <div class="relative w-full max-w-md m-auto text-lg text-gray-100 transition-all duration-300 bg-gray-800 rounded-lg">
    <form class="flex flex-col p-6 space-y-6" @submit.prevent="submit()">
      <h3 class="text-3xl font-extrabold text-center">Moderator</h3>
      <fieldset class="relative flex flex-col space-y-4">
        <div class="relative">
          <UiInput :input="tokenInput" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="token" type="password" autocomplete="admin-password" required @vnode-mounted="tokenInput.focus()" />
        </div>
        <div class="relative">
          <UiSelect :select="rememberSelect" class="w-full px-3 py-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600" :disabled="!tokenInput.value" placeholder="#" readonly>
            <template v-slot:input-right>
              <i class="p-1 cursor-pointer fa fa-caret-down hover:text-white" @click.self.prevent="rememberSelect.toggle()" />
            </template>
            <div class="bg-gray-700" @click="rememberSelect.close()">
              <div v-for="rememberItem in rememberOthers" :key="rememberItem" class="px-3 py-2 cursor-pointer hover:bg-gray-600" @mousedown="rememberSelect.value = rememberItem">{{ rememberItem }}</div>
            </div>
          </UiSelect>
        </div>
      </fieldset>
      <fieldset>
        <button v-if="tokenInput.value" class="relative w-full p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700" @click="save(), close()">Save token</button>
        <button v-else class="relative w-full p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-red-800 to-red-900 hover:from-red-700" @click="forget(), close()">Forget token</button>
      </fieldset>
    </form>
    <div class="absolute top-0 right-0 p-1 m-2 text-2xl text-gray-500 cursor-pointer hover:text-red-600" @click="close()">✖</div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue'
  import { onKeyStroke } from '@vueuse/core'
  import { modalAdmin } from '../../store/ui'
  import { tempToken, session, storage } from '../../store/storage'

  const tokenInput = reactive({ value: '', clearable: true } as TInput)

  const rememberList = [
    'Remember until the tab is refreshed',
    'Remember until the tab is closed',
    'Remember forever', //
  ]

  const rememberSelect = reactive({ value: rememberList[0] } as TSelect)

  const rememberOthers = computed(() => rememberList.filter((item) => item !== rememberSelect.value))

  onKeyStroke('Escape', close)

  function save() {
    forget()
    if (tokenInput.value[4] === ':') {
      switch (rememberSelect.value) {
        case rememberList[0]:
          tempToken.value = tokenInput.value
          break
        case rememberList[1]:
          session.value.token = tokenInput.value
          break
        case rememberList[2]:
          storage.value.token = tokenInput.value
          break
      }
    }
  }

  function forget() {
    tempToken.value = ''
    session.value.token = ''
    storage.value.token = ''
  }

  function submit() {
    if (tokenInput.value) {
      save()
    } else {
      forget()
    }
  }

  function close() {
    modalAdmin.close()
  }
</script>
