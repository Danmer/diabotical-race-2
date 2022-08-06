<template>
  <div class="relative flex flex-wrap items-center flex-1" :class="{ 'pointer-events-none opacity-50': $attrs.disabled }" @click.self="input.focus()">
    <slot name="left" />
    <input ref="el" :style="{ paddingRight: input.clearable ? '1.4em' : '' }" :value="input.value" v-bind="$attrs" @input="onInput" @focus="onFocus" @blur="onBlur" />
    <div class="absolute flex items-center transform -translate-y-1/2 top-1/2" style="right: 0.5em">
      <i v-if="input.clearable && input.value" class="p-1 -m-1 opacity-50 cursor-pointer fa fa-times hover:opacity-100" @click="input.clear()" />
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">
  // @ts-ignore
  import Inputmask from 'inputmask'
  import { defineComponent, ref, computed, PropType, onMounted, onBeforeUnmount } from 'vue'

  export default defineComponent({
    name: 'UiInput',
    inheritAttrs: false,
    props: {
      input: {
        type: Object as PropType<Partial<TInput>>,
        required: true,
      },
    },
    emits: ['focus', 'blur', 'input', 'clear'],
    setup(props, { emit }) {
      const el = ref()

      const input = Object.assign(props.input, {
        backup: '',
        value: '',
        focused: false,
        changed: false,
        clearable: false,
        lowercase: false,
        number: false,
        ...props.input,
        focus() {
          el.value?.focus()
        },
        select() {
          el.value?.select()
        },
        set(newValue: string) {
          if (input.lowercase) {
            newValue = newValue.toLowerCase()
          }
          input.changed = true
          input.value = newValue
          emit('input', newValue)
        },
        clear() {
          input.set('')
          emit('clear')
        },
      })

      onMounted(() => {
        if (input.mask && el.value) {
          const timeMask = new Inputmask({ mask: input.mask, showMaskOnHover: false })
          setTimeout(() => timeMask.mask(el.value), 300)
        }
      })

      onBeforeUnmount(() => {
        if (el.value && el.value.inputmask) {
          el.value.inputmask.remove()
        }
      })

      function onInput($event: Event) {
        const target = $event.currentTarget as HTMLInputElement & { inputmask: any }
        if (target.inputmask) {
          input.set(target.inputmask.unmaskedvalue())
        } else {
          input.set(target.value)
        }
      }

      function onFocus() {
        input.backup = input.value
        input.focused = true
        emit('focus')
      }

      function onBlur() {
        input.focused = false
        input.set(input.value.trim())
        emit('blur')
      }

      return {
        el,
        input,
        onInput,
        onFocus,
        onBlur,
      }
    },
  })
</script>
