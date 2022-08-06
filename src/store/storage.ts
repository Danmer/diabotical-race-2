import { computed, ref } from 'vue'
import { useLocalStorage, useSessionStorage } from '@vueuse/core'

export const defaultSession = {
  version: 7,
  token: '',
}

export const defaultStorage = {
  version: 7,
  token: '',
  config: {
    api: 'https://quakelife.ru/diabotical/race',
    // api: 'http://localhost/diabotical/race',
    days: true,
    players: true,
    lists: 'records',
    dataUpdating: 3600000,
    streamsUpdating: 600000,
    streamersOnTop: true,
    collapsedDays: false,
    mapThumbnails: true,
    mapIds: false,
    mapDates: false,
    mapTags: true,
    newDays: 1,
    runsCount: 7,
    runDates: false,
    runsSort: 'Date',
    mapsSort: 'New runs',
    playersSort: 'Medals',
    defaultPhysics: 'auto' as TPhysicsId | 'auto',
    runThumbnails: false,
    playerPhysics: true,
    animationLogo: true,
    animation: true,
    animationLimit: 200,
  },
  user: {
    name: '',
    flag: '',
    author: '',
    contacts: '',
    agreeMapRules: false,
    agreeRunRules: false,
  },
  data: {
    maps: [],
    runs: [],
    players: [],
    runRules: [],
    mapRules: [],
    eggcupRules: [],
    eggcups: [],
    presets: [],
    cup: {
      date: '',
      image: '../img/cup.jpg',
      link: '',
    },
  } as TData,
}

export const tempToken = ref('')

export const session = useSessionStorage('diabotical/race', defaultSession, { deep: true })

export const storage = useLocalStorage('diabotical/race', defaultStorage, { deep: true })

// Computed

export const userId = computed(() => storage.value.user.name && `${storage.value.user.flag}_${storage.value.user.name.toLowerCase()}`)

export const token = computed(() => tempToken.value || session.value.token || storage.value.token)

// Reset data if new version of storage

if (defaultSession.version !== session.value.version) {
  session.value = defaultSession
}

if (defaultStorage.version !== storage.value.version) {
  storage.value = defaultStorage
}

// Functions

export function resetStorages() {
  session.value = defaultSession
  storage.value = defaultStorage
}
