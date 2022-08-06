import { computed, reactive, watch, watchEffect } from 'vue'
import { until, useUrlSearchParams } from '@vueuse/core'
import { slided } from '../store'
import { getDay } from '../utils'
import { authors, authorsById, lastDay, players, tags, tagsById, visibleDays } from './data'

export const urlParams = useUrlSearchParams() as TUrlParams

export const filter = reactive<TFilter>({
  runsSearch: '',
  mapsSearch: '',
  playersSearch: '',
  tagsSearch: '',
  authorsSearch: '',
  dayId: '',
  playerId: '',
  playerOpposite: false,
  authorIds: new Set(),
  tagIds: new Set(),
})

watch(
  () => filter.playerId,
  () => (filter.playerOpposite = false)
)

// function validateUrlParams() {
//   const urlParams = useUrlSearchParams() as TUrlParams
//   if (urlParams.day) {
//     filter.dayId = getDay(urlParams.day)
//   }
//   if (urlParams.player) {
//     filter.playerId = players.value.find((player) => player.name.toLowerCase() === urlParams.player.toLowerCase() || player.id.toLowerCase() === urlParams.player.toLowerCase())?.id || ''
//   }
//   if (urlParams.authors) {
//     filter.authorIds = new Set(
//       paramToArray(urlParams.authors)
//         .map((a) => authors.value.find((author) => author.id === a.toLowerCase() || author.name.toLowerCase() === a.toLowerCase())?.id || '')
//         .filter((a) => a)
//     )
//   }
//   if (urlParams.tags) {
//     filter.tagIds = new Set(
//       paramToArray(urlParams.tags)
//         .map((a) => tags.value.find((tag) => tag.id === a.toLowerCase() || tag.name.toLowerCase() === a.toLowerCase())?.id || '')
//         .filter((a) => a)
//     )
//   }
// }

until(authors)
  .changed()
  .then(() => {
    if (urlParams.map) {
      filter.mapsSearch = urlParams.map
    }
    if (urlParams.day) {
      filter.dayId = getDay(urlParams.day)
    }
    if (urlParams.player) {
      filter.playerId = players.value.find((player) => player.name.toLowerCase() === urlParams.player.toLowerCase() || player.id.toLowerCase() === urlParams.player.toLowerCase())?.id || ''
    }
    if (urlParams.authors) {
      filter.authorIds = new Set(
        paramToArray(urlParams.authors)
          .map((a) => authors.value.find((author) => author.id === a.toLowerCase() || author.name.toLowerCase() === a.toLowerCase())?.id || '')
          .filter((a) => a)
      )
    }
    if (urlParams.tags) {
      filter.tagIds = new Set(
        paramToArray(urlParams.tags)
          .map((a) => tags.value.find((tag) => tag.id === a.toLowerCase() || tag.name.toLowerCase() === a.toLowerCase())?.id || '')
          .filter((a) => a)
      )
    }
  })

export function prevDay() {
  const currentIndex = visibleDays.value.findIndex((day) => day.id === filter.dayId)
  if (visibleDays.value[currentIndex + 1]) {
    filter.dayId = visibleDays.value[currentIndex + 1].id
  }
}

export function nextDay() {
  const currentIndex = visibleDays.value.findIndex((day) => day.id === filter.dayId)
  if (visibleDays.value[currentIndex - 1]) {
    filter.dayId = visibleDays.value[currentIndex - 1].id
  }
}

export function changeDayFilter(dayId: TDayId) {
  if (dayId) {
    filter.dayId = dayId
    slided.value = 0
  }
}

export function togglePlayerFilter(playerId: TPlayerId) {
  if (playerId) {
    filter.playerId = filter.playerId === playerId ? '' : playerId
    slided.value = 0
  }
}

export function addAuthorFilter(author: string) {
  const authorId = author.toLowerCase()
  if (!authorsById.value.has(authorId)) {
    console.warn(`Unknown author: ${authorId}`)
    return
  }
  filter.authorIds.add(authorId)
}

export function changeAuthorFilter(author: string) {
  const authorId = author.toLowerCase()
  if (!authorsById.value.has(authorId)) {
    console.warn(`Unknown author: ${authorId}`)
    return
  }
  if (filter.authorIds.has(authorId)) {
    filter.authorIds.delete(authorId)
    return
  }
  filter.authorIds = new Set([authorId])
}

export function toggleAuthorFilter(author: string) {
  const authorId = author.toLowerCase()
  if (!authorsById.value.has(authorId)) {
    console.warn(`Unknown author: ${authorId}`)
    return
  }
  if (filter.authorIds.has(authorId)) {
    filter.authorIds.delete(authorId)
  } else {
    filter.authorIds.add(authorId)
  }
}

export function removeAuthorFilter(author: string) {
  const authorId = author.toLowerCase()
  if (!authorsById.value.has(authorId)) {
    console.warn(`Unknown author: ${authorId}`)
    return
  }
  filter.authorIds.delete(authorId)
}

export function addTagFilter(tag: string) {
  const tagId = tag.toLowerCase()
  if (!tagsById.value.has(tagId)) {
    console.warn(`Unknown tag: ${tagId}`)
    return
  }
  if (tagId === 'community') {
    filter.tagIds.delete('official')
  } else if (tagId === 'official') {
    filter.tagIds.delete('community')
  }
  if (tagId === 'easy') {
    filter.tagIds.delete('normal')
    filter.tagIds.delete('hard')
  } else if (tagId === 'normal') {
    filter.tagIds.delete('easy')
    filter.tagIds.delete('hard')
  } else if (tagId === 'hard') {
    filter.tagIds.delete('easy')
    filter.tagIds.delete('normal')
  }
  filter.tagIds.add(tagId)
}

export function changeTagFilter(tag: string) {
  const tagId = tag.toLowerCase()
  if (!tagsById.value.has(tagId)) {
    console.warn(`Unknown tag: ${tagId}`)
    return
  }
  if (filter.tagIds.has(tagId)) {
    filter.tagIds.delete(tagId)
    return
  }
  filter.tagIds = new Set([tagId])
}

export function toggleTagFilter(tag: string) {
  const tagId = tag.toLowerCase()
  if (!tagsById.value.has(tagId)) {
    console.warn(`Unknown tag: ${tagId}`)
    return
  }
  if (filter.tagIds.has(tagId)) {
    filter.tagIds.delete(tagId)
  } else {
    if (tagId === 'community') {
      filter.tagIds.delete('official')
    } else if (tagId === 'official') {
      filter.tagIds.delete('community')
    }
    if (tagId === 'easy') {
      filter.tagIds.delete('normal')
      filter.tagIds.delete('hard')
    } else if (tagId === 'normal') {
      filter.tagIds.delete('easy')
      filter.tagIds.delete('hard')
    } else if (tagId === 'hard') {
      filter.tagIds.delete('easy')
      filter.tagIds.delete('normal')
    }
    filter.tagIds.add(tagId)
  }
}
export function removeTagFilter(tag: string) {
  const tagId = tag.toLowerCase()
  if (!tagsById.value.has(tagId)) {
    console.warn(`Unknown tag: ${tagId}`)
    return
  }
  filter.tagIds.delete(tagId)
}

export function addMapFilter(map: string) {
  filter.mapsSearch = map
}

export function removeAllFilters() {
  filter.dayId = lastDay.value
  filter.runsSearch = ''
  filter.mapsSearch = ''
  filter.playersSearch = ''
  filter.playerId = ''
  filter.tagIds.clear()
  filter.authorIds.clear()
}

function paramToArray(param: string | Array<string>) {
  if (param instanceof Array) {
    return param
  }
  if (typeof param === 'string') {
    return param.split(',').map((p) => p.trim())
  }
  return []
}
