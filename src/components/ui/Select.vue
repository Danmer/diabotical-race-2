<template>
  <UiInput :input="select" v-bind="$attrs" @focus="select.open()" @blur="onBlur()">
    <template v-slot:left>
      <slot name="input-left" />
    </template>
    <template v-slot:right>
      <slot name="input-right" />
    </template>
  </UiInput>
  <UiDropdown :dropdown="select" class="left-0 right-0 overflow-hidden rounded top-full" @open="select.changed = false" @clickOutside="select.focused ? '' : select.close()">
    <slot />
  </UiDropdown>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue'

  export default defineComponent({
    name: 'UiSelect',
    inheritAttrs: false,
    props: {
      select: {
        type: Object as PropType<TSelect>,
        required: true,
      },
    },
    setup(props) {
      function onBlur() {
        setTimeout(() => {
          if (!props.select.focused) {
            props.select.close()
          }
        }, 10)
      }
      return {
        onBlur,
      }
    },
  })
</script>
