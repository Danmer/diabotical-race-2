<template>
  <Transition name="fade">
    <div v-if="modal.visible" ref="element" class="fixed inset-0 z-50 flex items-center justify-center p-2 transition-opacity bg-black bg-opacity-75" :class="[{ 'pointer-events-none': modal.closing }, modal.active ? 'opacity-100' : 'opacity-0']" :style="{ zIndex }" @click.self="onClickOutside()">
      <Transition name="zoom">
        <slot v-if="modal.active" @click.stop />
      </Transition>
    </div>
  </Transition>
</template>

<script lang="ts">
  import { defineComponent, ref, reactive, provide, watch, onMounted, PropType, nextTick } from 'vue'

  let index = 0

  export default defineComponent({
    name: 'UiModal',
    props: {
      modal: {
        type: Object as PropType<Partial<TModal>>,
        required: true,
      },
    },
    events: ['init', 'clickOutside', 'open', 'opened', 'close', 'closed'],
    setup(props, { emit }) {
      const element = ref()
      const zIndex = ref(index)

      let openingTimeout = 0
      let closingTimeout = 0

      const modal = Object.assign(props.modal, {
        closing: false,
        opening: false,
        open(data: any) {
          modal.data = data
          if (modal.active) {
            return false
          }
          emit('open')
          index++
          zIndex.value = 50 + index
          modal.visible = true
          nextTick(() => (modal.active = true))
          modal.closing = false
          modal.opening = true
          clearTimeout(openingTimeout)
          clearTimeout(closingTimeout)
          openingTimeout = setTimeout(() => {
            modal.opening = false
            if (modal.active) {
              emit('opened')
            }
          }, 300)
        },
        async close() {
          if (!modal.active) {
            return false
          }
          emit('close')
          modal.opening = false
          modal.closing = true
          modal.active = false
          clearTimeout(openingTimeout)
          clearTimeout(closingTimeout)
          closingTimeout = setTimeout(() => {
            modal.closing = false
            modal.visible = false
            if (!modal.active) {
              emit('closed')
            }
          }, 300)
        },
      })

      provide('modal', modal)

      // watch(modal, () => {
      //   emit('update:modelValue', modal)
      // })

      onMounted(() => {
        emit('init', modal)
      })

      function onClickOutside() {
        emit('clickOutside')
      }

      return {
        element,
        modal,
        zIndex,
        onClickOutside,
      }
    },
  })
</script>

<style scoped>
  .shadow {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
  }
</style>
