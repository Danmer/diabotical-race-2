<template>
  <div ref="el" class="absolute z-30 pb-3 pl-3 pr-3 -mb-3 -ml-3 -mr-3" :class="{ 'pointer-events-none': !dropdown.active, 'overflow-hidden': dropdown.opening || dropdown.closing }">
    <Transition name="dropdown">
      <div v-if="dropdown.active" class="overflow-hidden transition-all duration-300 border-t border-gray-700 border-opacity-25 rounded shadow">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, provide, PropType, nextTick, onMounted } from 'vue'
  import { onClickOutside } from '@vueuse/core'

  export default defineComponent({
    name: 'UiDropdown',
    props: {
      dropdown: {
        type: Object as PropType<TDropdown>,
        required: true,
      },
    },
    events: ['update:dropdown', 'clickOutside', 'open', 'opened', 'close', 'closed'],
    setup(props, { emit }) {
      const el = ref()

      let openingTimeout = 0
      let closingTimeout = 0

      const dropdown = Object.assign(props.dropdown, {
        active: false,
        closing: false,
        opening: false,
        open() {
          //   console.log('open dropdown')
          if (dropdown.active) {
            return false
          }
          emit('open')
          dropdown.closing = false
          dropdown.opening = true
          dropdown.active = true
          clearTimeout(openingTimeout)
          clearTimeout(closingTimeout)
          openingTimeout = setTimeout(() => {
            dropdown.opening = false
            if (dropdown.active) {
              emit('opened')
            }
          }, 300)
        },
        close() {
          // console.log('close dropdown')
          if (!dropdown.active) {
            return false
          }
          emit('close')
          dropdown.opening = false
          dropdown.closing = true
          nextTick(() => (dropdown.active = false))
          clearTimeout(openingTimeout)
          clearTimeout(closingTimeout)
          closingTimeout = setTimeout(() => {
            dropdown.closing = false
            if (!dropdown.active) {
              emit('closed')
            }
          }, 300)
        },
        toggle() {
          // console.log('toggle dropdown')
          if (!dropdown.closing) {
            if (dropdown.active) {
              dropdown.close()
            } else {
              dropdown.open()
            }
          }
        },
      })

      provide('dropdown', dropdown)

      onClickOutside(el, () => {
        if (dropdown.active && !dropdown.opening) {
          emit('clickOutside')
        }
      })

      return {
        el,
        dropdown,
      }
    },
  })
</script>
