import { ref } from 'vue'
import { useEventBus, useNow, usePreferredLanguages, useWindowFocus } from '@vueuse/core'

export const loading = ref(-1)

export const physicsSwitcher = ref<TPhysicsId | ''>('')

export const daysCollapser = ref(false)

export const slided = ref(0)

export const now = useNow({ interval: 1000 })

export const focused = useWindowFocus()

export const languages = usePreferredLanguages()

export const runsUpdates = useEventBus<TRun>('runsUpdates')

export const hoveredStreamId = ref(0)
