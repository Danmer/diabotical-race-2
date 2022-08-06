import { defineComponent, h, PropType } from 'vue'

export default defineComponent({
  name: 'UiApproving',
  props: {
    run: {
      type: Object as PropType<TRun>,
      required: true,
    },
  },
  render() {
    return h('span', { title: this.$props.run.replacer ? 'Rejected run' : 'The run will be reviewed soon' }, [h('i', { class: `mr-1 text-center fa fa-${this.$props.run.replacer ? 'ban' : 'hourglass-half'}`, style: 'width: 1.45em' }), this.$props.run.replacer || 'Approving'])
  },
})
