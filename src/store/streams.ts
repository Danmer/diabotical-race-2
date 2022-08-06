import { computed, shallowRef, triggerRef, watch, watchEffect } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { getStreams } from '../api'
import { config } from './config'
import { playersById } from './data'

export const streamsById = shallowRef(new Map<TStreamId, TStream>())
export const streams = computed(() => [...streamsById.value.values()])

const { pause, resume } = useIntervalFn(updateStreams, config.streamsUpdating)

watchEffect(() => {
  for (const [playerId, player] of playersById.value) {
    if (!config.streamsUpdating) {
      player.stream = null
      continue
    }
    player.stream = streamsById.value.get(player.twitchId) || streams.value.find((stream) => stream.channel.name.toLowerCase() === player.twitchName.toLowerCase()) || null
  }
})

watch(
  () => config.streamsUpdating,
  (newValue) => {
    if (newValue) {
      updateStreams()
      resume()
    } else {
      pause()
      streamsById.value.clear()
      triggerRef(playersById)
    }
  },
  { immediate: true }
)

export async function updateStreams() {
  console.time('⏳ loading streams')
  streamsById.value.clear()
  const streamsData = await getStreams()
  for (const stream of streamsData.streams) {
    streamsById.value.set(stream.id, stream)
  }
  triggerRef(streamsById)
  triggerRef(playersById)
  console.timeEnd('⏳ loading streams')
  console.log(`📊 ${streamsById.value.size} streams`)
}
