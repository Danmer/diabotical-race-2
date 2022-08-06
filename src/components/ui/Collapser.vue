<template>
  <div class="flex flex-col justify-end transition-all duration-300" :class="{ 'overflow-hidden': collapser.opening || collapser.closing }" :style="{ height: collapser.active ? height : 0 }" style="transition: all 0.5s">
    <div ref="el">
      <slot v-if="collapser.visible || collapser.active" />
    </div>
  </div>
</template>

<script lang="ts">
  import { useResizeObserver } from '@vueuse/core'
  import { defineComponent, ref, provide, onMounted, PropType, nextTick } from 'vue'
  import { daysCollapser } from '../../store/index'

  export default defineComponent({
    name: 'UiCollapser',
    props: {
      collapser: {
        type: Object as PropType<TCollapser>,
        required: true,
      },
    },
    events: ['update:modelValue', 'open', 'opened', 'close', 'closed'],
    setup(props, { emit }) {
      const el = ref<HTMLElement>()
      const height = ref('auto')

      const active = typeof props.collapser.active !== undefined ? props.collapser.active : !daysCollapser.value

      let openingTimeout = 0
      let closingTimeout = 0

      const collapser = Object.assign(props.collapser, {
        active: true,
        visible: true,
        closing: false,
        opening: false,
        open() {
          // console.log('open collapser')
          if (collapser.active) {
            return false
          }
          emit('open')
          collapser.closing = false
          collapser.opening = true
          collapser.active = true
          clearTimeout(openingTimeout)
          clearTimeout(closingTimeout)
          openingTimeout = setTimeout(() => {
            collapser.opening = false
            collapser.visible = true
            if (collapser.active) {
              emit('opened')
            }
          }, 300)
        },
        close() {
          // console.log('close collapser')
          if (!collapser.active) {
            return false
          }
          emit('close')
          collapser.opening = false
          collapser.closing = true
          collapser.active = false
          clearTimeout(openingTimeout)
          clearTimeout(closingTimeout)
          closingTimeout = setTimeout(() => {
            collapser.closing = false
            collapser.visible = false
            if (!collapser.active) {
              emit('closed')
            }
          }, 300)
        },
        toggle() {
          // console.log('toggle collapser')
          if (collapser.active) {
            collapser.close()
          } else {
            collapser.open()
          }
        },
      })

      provide('collapser', collapser)

      onMounted(() => {
        useResizeObserver(el.value, onResize)
        height.value = height.value = `${el.value?.scrollHeight}px`
        collapser.active = active
        collapser.visible = active
      })

      function onResize(entries: any) {
        const newHeight = entries[0]?.contentRect?.height
        if (newHeight) {
          height.value = `${newHeight}px`
        }
      }

      return {
        el,
        height,
        open: collapser.open, // to call it from parent
        close: collapser.close, // to call it from parent
        toggle: collapser.toggle, // to call it from parent
      }
    },
  })
</script>
