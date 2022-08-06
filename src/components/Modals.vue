<template>
  <UiModal :modal="modalMap">
    <ModalMap />
  </UiModal>

  <UiModal :modal="modalRun">
    <ModalRun />
  </UiModal>

  <UiModal :modal="modalVideo" @clickOutside="modalVideo.close()">
    <ModalVideo />
  </UiModal>

  <UiModal :modal="modalPlayer">
    <ModalPlayer />
  </UiModal>

  <UiModal :modal="modalEggcup">
    <ModalEggcup />
  </UiModal>

  <UiModal :modal="modalAdmin" @clickOutside="modalAdmin.close()">
    <ModalAdmin />
  </UiModal>
</template>

<script setup lang="ts">
  import ModalVideo from './modals/Video.vue'
  import ModalRun from './modals/Run.vue'
  import ModalMap from './modals/Map.vue'
  import ModalPlayer from './modals/Player.vue'
  import ModalEggcup from './modals/Eggcup.vue'
  import ModalAdmin from './modals/Admin.vue'
  import { modalRun, modalMap, modalVideo, modalPlayer, modalEggcup, modalAdmin } from '../store/ui'
</script>
