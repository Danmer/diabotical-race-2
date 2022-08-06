import { defineComponent, h, PropType } from 'vue'
import UiFlag from './Flag'

export default defineComponent({
  name: 'UiPlayer',
  props: {
    player: {
      type: Object as PropType<TPlayer>,
      required: true,
    },
  },
  render() {
    return h(
      'div',
      {
        class: 'flex items-center -my-1 overflow-hidden leading-5',
      },
      [
        h(UiFlag, {
          class: 'mr-1',
          country: this.$props.player.flag,
        }),
        h(
          'div',
          {
            class: 'truncate',
          },
          this.$props.player.name
        ),
      ]
    )
  },
})
