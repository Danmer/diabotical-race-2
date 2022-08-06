import { useUrlSearchParams } from '@vueuse/core'
import { storage } from './storage'

const urlParams = useUrlSearchParams() as TUrlParams

export const config = storage.value.config

config.mapsSort = urlParams.sortMaps || config.mapsSort

config.playersSort = urlParams.sortPlayers || config.playersSort
