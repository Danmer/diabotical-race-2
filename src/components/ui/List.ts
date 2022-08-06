import { defineComponent, ref, computed, TransitionGroup, h, VNode, nextTick, onMounted } from 'vue'
import { config } from '../../store/config'
import { physicsSwitcher } from '../../store/index'
import { useIntersectionObserver, useMutationObserver } from '@vueuse/core'

let paginating = false

export default defineComponent({
  name: 'UiList',
  props: {
    count: {
      type: Number,
      default: 100,
    },
    fillers: {
      type: Number,
      default: 0,
    },
    animation: {
      type: String,
    },
  },
  data() {
    return {}
  },
  setup(props, { slots }) {
    const element = ref()
    const lastElement = ref()
    const page = ref(1)

    let counter = 0

    const maxChildrenCount = computed(() => props.count * page.value)

    // check if animation enabled, if not too many children, if not switching physics of all maps
    const animationName = computed(() => (props.animation !== undefined ? props.animation : config.animation && maxChildrenCount.value < config.animationLimit && !physicsSwitcher.value ? 'animated' : undefined))

    const allChildren = computed(() => (slots as any).default()[0].children)

    const visibleChildren = computed(() => {
      counter = Math.random()

      const newChildren: VNode[] = []
      for (let index = 0; index < allChildren.value.length; index++) {
        const child = allChildren.value[index]
        const entity = child.props?.run || child.props?.player
        if (index < maxChildrenCount.value || entity?.active || entity?.mine) {
          newChildren.push(allChildren.value[index])
        }
      }

      return newChildren
    })

    const newSlot = computed(() => {
      if (!allChildren.value.length) {
        return []
      }

      const fillers: VNode[] = []
      for (let index = 0; index < props.fillers; index++) {
        fillers.push(h('div', { class: visibleChildren.value[0]?.props?.class, style: { ...visibleChildren.value[0]?.props?.style, marginBottom: 0, marginTop: 0 } }))
      }

      return [
        h(
          TransitionGroup,
          { css: false },
          {
            default() {
              return visibleChildren.value
            },
          }
        ),
        [...fillers, h('div', { ref: 'lastElement', style: 'h-[1px] -mt-[1px]' }, visibleChildren.value.length < allChildren.value.length ? h('div', { class: 'text-center p-2 text-gray-400 cursor-pointer hover:text-gray-200', onClick: showNextPage }, 'show more') : '')],
      ]
    })

    onMounted(() => {
      useIntersectionObserver(lastElement.value, onIntersect, { root: element.value, rootMargin: '5%', threshold: 1 })
      useMutationObserver(element.value, onMutate, { childList: true, attributes: true })
    })

    function onIntersect([entry]: IntersectionObserverEntry[]) {
      if (entry.isIntersecting) {
        showNextPage()
      }
    }

    function onMutate() {
      if (element.value?.scrollHeight === element.value?.clientHeight && visibleChildren.value.length < allChildren.value.length) {
        page.value++
      }
    }

    function showNextPage() {
      paginating = true
      page.value++
    }

    function scrollToTop() {
      nextTick(() => {
        element.value?.scrollTo({ left: 0, top: 0 })
      })
    }

    return {
      element,
      lastElement,
      animationName,
      newSlot,
      page,
      scrollToTop,
      showNextPage,
    }
  },
  render() {
    if (!this.count) {
      return false
    }

    const newSlot = this.newSlot

    return h(
      'div',
      { class: this.animationName, ref: 'element' },
      {
        default() {
          return newSlot
        },
      }
    )
  },
})
