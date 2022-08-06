<template>
  <div class="relative flex flex-col m-auto transition-all duration-300" :style="{ width: '90%', maxWidth: '150vh' }">
    <div class="relative w-full bg-black rounded aspect-video">
      <iframe class="absolute w-full h-full" :src="src" allow="autoplay" allowfullscreen />
      <div class="absolute top-0 right-0 p-1 m-2 text-2xl text-gray-500 cursor-pointer hover:text-red-600" @click="close()">✖</div>
    </div>

    <div class="flex flex-col items-start w-full mt-2 space-y-2 sm:flex-row sm:space-y-0" v-if="token && data.datetime">
      <!-- Edit -->
      <div class="items-center hidden mr-4 space-x-2 md:flex">
        <div class="p-3 text-lg font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-red-800 to-red-900 hover:from-red-700" title="Delete run" @click="deleteWithCofirm()"><i class="fa fa-fw fa-trash" /></div>
        <div class="p-3 text-lg font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700" title="Edit run" @click="modalRun.open(data)"><i class="fa fa-fw fa-edit" /></div>
        <UiInput :input="replacerInput" class="flex-1 p-2 leading-6 bg-gray-700 rounded sm:grow-0 w-36 focus:bg-gray-600" placeholder="Reason of reject" />
      </div>

      <div class="hidden p-3 mb-2 mr-4 font-bold text-center text-white uppercase rounded cursor-pointer select-none sm:flex md:hidden bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700" title="Edit run" @click="modalRun.open(data)"><i class="fa fa-fw fa-edit" /></div>

      <div class="hidden sm:flex sm:flex-1">&nbsp;</div>

      <!-- Icons -->
      <div class="flex flex-wrap items-center -mb-2 -ml-1">
        <div v-for="[iconName, iconTitle] in icons" class="p-2 mb-1 ml-1 text-xl font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600" :title="iconTitle" @click="selectedIcons[iconName] = selectedIcons[iconName] ? undefined : iconTitle">
          <i class="fa" :class="`fa-${iconName}`" :style="selectedIcons[iconName] ? {} : { color: '#678' }" />
        </div>
      </div>

      <div class="hidden w-4 sm:flex"></div>

      <!-- Approve/Reject -->
      <div class="flex w-full sm:w-auto sm:flex-shrink-0 sm:grow-0">
        <div class="p-3 mr-2 font-bold text-center text-white uppercase rounded cursor-pointer select-none sm:hidden bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700" title="Edit run" @click="modalRun.open(data)"><i class="fa fa-fw fa-edit" /></div>
        <div v-if="replacerInput.value" class="flex-1 px-3 py-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-yellow-800 to-yellow-900 hover:from-yellow-700" @click="save()">Reject</div>
        <div v-else class="flex justify-center flex-1 px-3 py-3 space-x-2 font-bold text-center text-white uppercase rounded cursor-pointer select-none items-cennter sm:grow-0 bg-gradient-to-br from-green-700 to-green-900 hover:from-green-600" @click="save()">
          <span>Approve</span>
          <i class="mr-1 fa fa-stopwatch" />
          <span>{{ prettyTime(data.time) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue'
  import { onKeyStroke } from '@vueuse/core'
  import { saveRun, deleteRun } from '../../api'
  import { runsById, updateData } from '../../store/data'
  import { modalRun, modalVideo } from '../../store/ui'
  import { token } from '../../store/storage'
  import { getEmbedLink, prettyTime } from '../../utils'

  const { data } = modalVideo

  const replacerInput = reactive({ value: data.replacer || '' } as TInput)
  const selectedIcons = reactive(data.icons || {})

  const src = computed(() => getEmbedLink(data.video))

  const icons = computed(() => {
    const icons = new Map<string, string>([
      ['ban red', 'obsolete'],
      ['running green', 'without weapon'],
      ['rocket orange', 'with weapon'],
    ])
    for (const [runId, run] of runsById.value) {
      for (const icon in run.icons) {
        if (icon !== 'medal yellow') {
          icons.set(icon, run.icons[icon])
        }
      }
    }
    return icons
  })

  onKeyStroke('Escape', () => {
    if (!modalRun.active) {
      modalVideo.close()
    }
  })

  function save() {
    saveRun({ replacer: replacerInput.value, icons: selectedIcons, datetime: data.datetime, video: data.video, eggcup: data.eggcup, approved: !replacerInput.value }).then(() => {
      updateData()
      close()
    })
  }

  function deleteWithCofirm() {
    if (window.confirm('Are you sure?')) {
      deleteRun(data).then(() => {
        updateData()
        close()
      })
    }
  }

  function close() {
    modalVideo.close()
  }
</script>
