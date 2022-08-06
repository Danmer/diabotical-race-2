import '../../assets/flags.css'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'UiFlag',
  props: {
    country: {
      type: String,
      default: '',
    },
  },
  render() {
    return h('div', { class: `rounded-[0.1em] flag flag-${this.$props.country}`, title: this.$props.country }, '')
  },
})
