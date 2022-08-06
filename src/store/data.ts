import { computed, ref, shallowRef, triggerRef, watch, watchEffect } from 'vue'
import { getData } from '../api'
import { compareStrings, getDay, includeString } from '../utils'
import { config } from './config'
import { tagsDataById } from './dict'
import { filter } from './filter'
import { storage, userId } from './storage'

// Variables

export const updating = ref(0)

export const data = shallowRef(storage.value.data)

export const runRules = shallowRef<string[]>(data.value.runRules || [])
export const mapRules = shallowRef<string[]>(data.value.mapRules || [])
export const eggcupRules = shallowRef<string[]>(data.value.eggcupRules || [])
export const eggcups = shallowRef(data.value.eggcups || [])
export const presets = shallowRef(data.value.presets || [])
export const cup = shallowRef(data.value.cup)

export const physicsIds = ['race', 'vintage', 'diabotical'] as TPhysicsId[]

export const daysById = shallowRef(new Map<TDayId, TDay>())
export const runsById = shallowRef(new Map<TRunId, TRun>())
export const mapsById = shallowRef(new Map<TMapId, TMap>())
export const playersById = shallowRef(new Map<TPlayerId, TPlayer>())
export const authorsById = shallowRef(new Map<TAuthorId, TAuthor>())
export const tagsById = shallowRef(new Map<TTagId, TTag>())
export const physicsById = shallowRef(new Map<TPhysicsId, TPhysics>())
export const iconsById = shallowRef(new Map<string, string>())

export const allRunsByGroups = shallowRef(new Map<TMapId, Map<number, Map<TPhysicsId, Map<TRunId, TRun>>>>())
export const allRecordsByGroups = shallowRef(new Map<TMapId, Map<number, Map<TPhysicsId, Map<TPlayerId, TRun>>>>())
export const runsByGroups = shallowRef(new Map<TMapId, Map<number, Map<TPhysicsId, Map<TRunId, TRun>>>>())
export const recordsByGroups = shallowRef(new Map<TMapId, Map<number, Map<TPhysicsId, Map<TPlayerId, TRun>>>>())

// Global rating functions

Object.assign(window, {
  // basic
  getRating(time: number, wr: number, placement: number, runs: number, difficulty: number, run?: TRun) {
    if (runs > 5) {
      const k1 = wr / time
      const points = runs - placement
      return points * k1
    }
    return 0
  },

  /*
  // EE System
  getRating(time: number, wr: number, placement: number, runs: number, difficulty: number, run?: TRun) {
    const k1 = wr / time
    const k2 = 1.05 - placement * (placement < 6 ? 0.05 : placement < 11 ? 0.025 : placement < 21 ? 0.01 : 0.005)
    const pts = 1000
    return Math.round(pts * k1 * k2)
  },
  
  // Good
  getRating(time: number, wr: number, placement: number, runs: number, difficulty: number, run?: TRun) {
    const k1 = wr / time // how bad is your time comparing to wr
    const k2 = Math.pow(1 - placement / runs, 1.5) // exponential grow based on placement (the higher placement the more significant grow)
    const k3 = Math.log(runs) // slowing down impact of runs count (only first 10 runs make a significant boost)
    const points = 10 // max points doesn't depend on difficulty and runs count (add sense to play new or hard maps)
    return Math.round(points * k1 * k2 * k3) + difficulty
  },

  // without placements
  getRating(time: number, wr: number, placement: number, runs: number, difficulty: number, run?: TRun) {
    const k1 = Math.pow(wr / time, 20) // how bad is your time comparing to wr
    const k2 = 1
    const k3 = Math.log(runs) // slowing down impact of runs count (only first 10 runs make a significant boost)
    const points = 10 // max points doesn't depend on difficulty and runs count (add sense to play new or hard maps)
    return Math.round(points * k1 * k2 * k3) + difficulty
  },
  
  getRating(time: number, wr: number, placement: number, runs: number, difficulty: number, run?: TRun) {
    const k1 = Math.pow(wr / time, 5) // how bad is your time comparing to wr
    const k2 = Math.pow(1 - placement / runs, 1.1) // exponential grow based on placement (the higher placement the more significant grow)
    const k3 = Math.log(runs) // slowing down impact of runs count (only first 10 runs make a significant boost)
    const points = 10 // max points doesn't depend on difficulty and runs count (add sense to play new or hard maps)
    return points * k1 * k2 * k3 + difficulty
  },
  */

  getPlacement(player: TPlayer) {
    return 0
    // return [...player.records.values()]
    //   .sort((run1, run2) => run2.ratingDiff - run1.ratingDiff)
    //   .slice(0, 20)
    //   .reduce((total, run) => total + run.ratingDiff, 0)
  },

  updateRatings() {
    calculcateRatings()
    triggerRef(recordsByGroups)
    triggerRef(playersById)
  },
})

// Computed variables

export const lastDay = computed(() => [...daysById.value.values()].shift()?.id || '')

export const days = computed(() => [...daysById.value.values()])
export const runs = computed(() => [...runsById.value.values()])
export const maps = computed(() => [...mapsById.value.values()])
export const players = computed(() => [...playersById.value.values()])
export const authors = computed(() => [...authorsById.value.values()])
export const tags = computed(() => [...tagsById.value.values()])
export const icons = computed(() => [...iconsById.value.entries()].map((entry) => entry.join(':')))
export const presetsById = computed(() => presets.value.reduce((result, preset) => ({ ...result, [`${preset.id}`]: preset }), {} as Record<string, TPreset>))

export const visibleDays = computed(() => {
  const newVisibleDays = new Map()
  // has visible runs
  for (const run of visibleRuns.value) {
    if (!newVisibleDays.has(run.dayId)) {
      newVisibleDays.set(run.dayId, run.day)
    }
  }
  // has new maps
  if (!filter.playerId) {
    for (const [dayId, day] of daysById.value) {
      if (!newVisibleDays.has(dayId) && [...day.newMaps.values()].find((map) => !map.hidden && includeString(map.name, filter.runsSearch))) {
        newVisibleDays.set(dayId, day)
      }
    }
  }
  return [...newVisibleDays.values()].sort((day1, day2) => compareStrings(day2.id, day1.id))
})

export const visibleRuns = computed(() => {
  return runs.value.filter((run) => {
    // run.hidden = isRunHidden(run)
    return !run.hidden
  })
})

export const visibleMaps = computed(() =>
  maps.value.filter((map) => {
    map.faded = (filter.playerId && ((filter.playerOpposite && map.players.has(filter.playerId)) || (!filter.playerOpposite && !map.players.has(filter.playerId)))) || (filter.mapsSearch && !includeString(map.name, filter.mapsSearch)) ? 1 : 0
    return !map.hidden && map.approved
  })
)

export const visiblePlayers = computed(() =>
  players.value.filter((player) => {
    player.faded = !player.runs.size || (filter.playersSearch && !includeString(player.name, filter.playersSearch)) ? 1 : 0
    return !player.hidden
  })
)

export const visibleAuthors = computed(() =>
  authors.value.filter((author) => {
    author.faded = !author.maps.size || (filter.playerId && !author.players.has(filter.playerId)) || (filter.authorsSearch && !includeString(author.name, filter.authorsSearch)) ? 1 : 0
    return !author.hidden
  })
)

export const visibleTags = computed(() =>
  tags.value.filter((tag) => {
    tag.faded = !tag.maps.size || (filter.playerId && !tag.players.has(filter.playerId)) || (filter.tagsSearch && !includeString(tag.name, filter.tagsSearch)) ? 1 : 0
    return !tag.hidden
  })
)

// Watchers

watch(data, buildCollections)

watch(data, groupCollections)

watchEffect(filterCollections)

watch(runsByGroups, calculcateDiffs)
watch(recordsByGroups, calculcateRatings)

watchEffect(calculcatePhysics)

let dataUpdating = 0
watch(
  () => config.dataUpdating,
  (newValue) => {
    if (newValue) {
      updateData()
      clearInterval(dataUpdating)
      dataUpdating = setInterval(updateData, newValue)
    } else {
      clearInterval(dataUpdating)
    }
  }
  // { immediate: true }
)

// if (storage.value.data) {
//   triggerRef(data)
// }

// Functions

export function buildCollections() {
  console.time('⏳ creating collections')

  daysById.value.clear()
  runsById.value.clear()
  mapsById.value.clear()
  playersById.value.clear()
  authorsById.value.clear()
  tagsById.value.clear()
  physicsById.value.clear()
  iconsById.value.clear()

  const newData = data.value

  newData.runs.sort((run1, run2) => (run2.time > run1.time ? -1 : run2.time < run1.time ? 1 : run1.datetime > run2.datetime ? 1 : -1))

  // console.time('creating physics')
  for (const physicsId of physicsIds) {
    createPhysics(physicsId)
  }
  // console.timeEnd('creating physics')

  // predefined tags
  // console.time('creating tags')
  for (const tagId in tagsDataById) {
    createTag(tagId)
  }
  // console.timeEnd('creating tags')

  // console.time('creating maps')
  for (const rawMap of newData.maps || []) {
    createMap(rawMap) // => createAuthor(), createTag()
  }
  // console.timeEnd('creating maps')

  // predefined players
  // console.time('creating players')
  for (const rawPlayer of newData.players || []) {
    createPlayer(rawPlayer)
  }
  // console.timeEnd('creating players')

  // console.time('creating runs')
  for (const rawRun of newData.runs || []) {
    createRun(rawRun) // => createPlayer(), createDay()
  }
  // console.timeEnd('creating runs')

  const dayIds = [...daysById.value.keys()].sort(compareStrings).reverse()
  daysById.value = new Map(dayIds.map((dayId) => [dayId, daysById.value.get(dayId) as TDay]))

  console.log(`📊 ${daysById.value.size} days`)
  console.log(`📊 ${runsById.value.size} submissions`)
  console.log(`📊 ${playersById.value.size} players`)
  console.log(`📊 ${mapsById.value.size} maps`)
  console.log(`📊 ${authorsById.value.size} authors`)
  console.log(`📊 ${tagsById.value.size} tags`)

  runRules.value = newData.runRules || []
  mapRules.value = newData.mapRules || []
  eggcupRules.value = newData.eggcupRules || []
  eggcups.value = newData.eggcups || []
  presets.value = newData.presets || []
  cup.value = Object.assign(cup.value, newData.cup)

  filter.dayId = filter.dayId || lastDay.value

  console.timeEnd('⏳ creating collections')
}

export function groupCollections() {
  console.time('⏳ groupping collections')
  const prevRunsByGroups = new Map()
  allRecordsByGroups.value.clear()
  allRunsByGroups.value.clear()
  for (const [mapId, map] of mapsById.value) {
    allRecordsByGroups.value.set(map.id, new Map())
    allRunsByGroups.value.set(map.id, new Map())
    prevRunsByGroups.set(map.id, new Map())
    for (let version = 1; version <= map.version; version++) {
      allRecordsByGroups.value.get(map.id)?.set(version, new Map())
      allRunsByGroups.value.get(map.id)?.set(version, new Map())
      prevRunsByGroups.get(map.id)?.set(version, new Map())
      for (const physicsId of map.physicsIds) {
        allRecordsByGroups.value.get(map.id)?.get(version)?.set(physicsId, new Map())
        allRunsByGroups.value.get(map.id)?.get(version)?.set(physicsId, new Map())
        prevRunsByGroups.get(map.id)?.get(version)?.set(physicsId, new Map())
      }
    }
  }

  for (const [runId, run] of runsById.value) {
    if (!run.obsolete) {
      if (run.approved) {
        const physicsRuns = allRunsByGroups.value.get(run.mapId)?.get(run.version)?.get(run.physicsId) || new Map()
        const physicsRecords = allRecordsByGroups.value.get(run.mapId)?.get(run.version)?.get(run.physicsId) || new Map()
        const prevRuns = prevRunsByGroups.get(run.mapId)?.get(run.version)?.get(run.physicsId) || new Map()
        const prevRun = prevRuns.get(run.playerId)
        if (prevRun) {
          prevRun.timeDiff = prevRun.time - run.time
        }
        prevRuns.set(run.playerId, run)
        physicsRuns.set(run.id, run)
        if (!physicsRecords?.has(run.playerId)) {
          physicsRecords?.set(run.playerId, run)
        }
      }
      run.day.runs.set(run.id, run)
      if (!run.day.players.has(run.playerId)) {
        run.day.players.set(run.playerId, run.player)
      }
      if (!run.day.maps.has(run.mapId)) {
        run.day.maps.set(run.mapId, run.map)
      }
    }
  }
  console.timeEnd('⏳ groupping collections')
}

export function filterCollections() {
  console.time('⏳ filtering collections')

  runsByGroups.value.clear()
  recordsByGroups.value.clear()

  for (const [dayId, day] of daysById.value) {
    day.active = dayId === filter.dayId
  }

  for (const [physicsId, physics] of physicsById.value) {
    physics.maps.clear()
    physics.runs.clear()
    physics.records.clear()
    physics.players.clear()
  }

  for (const [tagId, tag] of tagsById.value) {
    tag.runs.clear()
    tag.records.clear()
    tag.players.clear()
    tag.maps.clear()
    tag.hidden = isTagHidden(tag)
    tag.active = filter.tagIds.has(tag.id)
  }

  for (const [authorId, author] of authorsById.value) {
    author.runs.clear()
    author.records.clear()
    author.players.clear()
    author.maps.clear()
    author.hidden = isAuthorHidden(author)
    author.active = filter.authorIds.has(author.id)
  }

  for (const [playerId, player] of playersById.value) {
    player.runs.clear()
    player.records.clear()
    player.maps.clear()
    player.rating = 0
    player.medals = [0, 0, 0, 0]
    player.hidden = isPlayerHidden(player)
    player.active = filter.playerId === player.id
    player.mine = !filter.playerId && player.id === userId.value
  }

  for (const [mapId, map] of mapsById.value) {
    map.runs.clear()
    map.newRuns.clear()
    map.records.clear()
    map.players.clear()
    map.hidden = isMapHidden(map)

    if (!map.hidden && map.dayId <= filter.dayId) {
      // const map = mapsById.value.get(mapId) as TMap ???
      for (const physicsId of map.physicsIds) {
        const physics = physicsById.value.get(physicsId) as TPhysics
        physics.maps.set(mapId, map)
      }
    }

    runsByGroups.value.set(map.id, new Map())
    recordsByGroups.value.set(map.id, new Map())
    for (let version = 1; version <= map.version; version++) {
      runsByGroups.value.get(map.id)?.set(version, new Map())
      recordsByGroups.value.get(map.id)?.set(version, new Map())
      for (const physicsId of map.physicsIds) {
        runsByGroups.value.get(map.id)?.get(version)?.set(physicsId, new Map())
        recordsByGroups.value.get(map.id)?.get(version)?.set(physicsId, new Map())
      }
    }

    if ([...filter.tagIds].every((tagId) => map.tags.has(tagId))) {
      for (const [authorId, author] of map.authors) {
        author.maps.set(map.id, map)
      }
    }

    if ([...filter.authorIds].every((authorId) => map.authors.has(authorId))) {
      for (const [tagId, tag] of map.tags) {
        tag.maps.set(map.id, map)
      }
    }
  }

  for (const [runId, run] of runsById.value) {
    const { map, player, day, physics } = run

    run.hidden = isRunHidden(run)
    run.active = player.active
    run.mine = player.mine
    run.pb = false
    run.wr = false
    run.new = run.dayId >= getDay(filter.dayId, 1 - config.newDays)

    if (!map.hidden && !run.obsolete && run.dayId <= filter.dayId) {
      const physicsRuns = runsByGroups.value.get(run.mapId)?.get(run.version)?.get(run.physicsId) || new Map()
      const physicsRecords = recordsByGroups.value.get(run.mapId)?.get(run.version)?.get(run.physicsId) || new Map()

      physicsRuns.set(run.id, run)
      //run.placement = physicsRuns.size

      // Run stats

      map.runs.set(run.id, run)
      player.runs.set(run.id, run)
      physics.runs.set(run.id, run)
      player.maps.set(run.mapId, map)
      physics.maps.set(run.mapId, map)
      map.players.set(run.playerId, player)
      physics.players.set(run.playerId, player)

      // New run stats

      if (run.new) {
        map.newRuns.set(run.id, run)
      }

      // Record stats

      if (!physicsRecords.has(run.playerId)) {
        physicsRecords.set(run.playerId, run)
        run.placement = physicsRecords.size
        run.pb = true
        map.records.set(run.id, run)
        player.records.set(run.id, run)
        physics.records.set(run.id, run)

        if (run.version === map.version) {
          Object.assign(map.icons, run.icons)

          if (run.placement < 4) {
            run.wr = physicsRecords.size === 1
            if (!map.until) {
              player.medals[run.placement]++
            }
          }
        }
      }
    }

    if ([...filter.tagIds].every((tagId) => map.tags.has(tagId))) {
      for (const [authorId, author] of map.authors) {
        author.runs.set(run.id, run)
        author.players.set(player.id, player)
        if (run.pb) {
          author.records.set(run.id, run)
        }
      }
    }

    if ([...filter.authorIds].every((authorId) => map.authors.has(authorId))) {
      for (const [tagId, tag] of map.tags) {
        // count only matched to run physics
        if (tag.group === 3 && tag.id !== run.physicsId) {
          continue
        }
        tag.runs.set(run.id, run)
        tag.players.set(player.id, player)
        if (run.pb) {
          tag.records.set(run.id, run)
        }
      }
    }
  }

  triggerRef(physicsById)
  triggerRef(daysById)
  triggerRef(runsById)
  triggerRef(mapsById)
  triggerRef(playersById)
  triggerRef(authorsById)
  triggerRef(tagsById)
  triggerRef(runsByGroups)
  triggerRef(recordsByGroups)

  console.timeEnd('⏳ filtering collections')
}

export function calculcateDiffs() {
  console.time('⏳ calculating placement diffs')
  for (const [mapId, mapVersions] of runsByGroups.value) {
    for (const [version, versionPhysics] of mapVersions) {
      for (const [physicsId, physicsRuns] of versionPhysics) {
        const lastRunsInfo = new Map<TPlayerId, { id: TRunId; playerId: TPlayerId; placement: number }>()
        const prevRunsInfo = new Map<TPlayerId, { id: TRunId; playerId: TPlayerId; placement: number }>()

        for (const [runId, run] of physicsRuns) {
          const prevRunInfo = lastRunsInfo.get(run.playerId)
          if (run.dayId < filter.dayId && !prevRunsInfo.has(run.playerId)) {
            prevRunsInfo.set(run.playerId, { id: run.id, playerId: run.playerId, placement: prevRunsInfo.size })
          }
          if (!prevRunInfo) {
            lastRunsInfo.set(run.playerId, { id: run.id, playerId: run.playerId, placement: lastRunsInfo.size })
          }
        }

        for (const [playerId, lastRunInfo] of lastRunsInfo) {
          const prevRunInfo = prevRunsInfo.get(lastRunInfo.playerId)
          const run = runsById.value.get(lastRunInfo.id) as TRun
          run.placementDiff = prevRunInfo ? prevRunInfo.placement - lastRunInfo.placement : 0
        }
      }
    }
  }
  console.timeEnd('⏳ calculating placement diffs')
}

export function calculcateRatings() {
  console.time('⏳ calculating ratings')
  for (const [mapId, mapVersions] of recordsByGroups.value) {
    const versionPhysics = [...mapVersions.values()].pop() || new Map()
    for (const [physicsId, records] of versionPhysics) {
      let wr = null
      for (const [playerId, record] of records) {
        if (!wr) {
          wr = record
        }
        const difficulty = record.map.tags.has('hard') ? 3 : record.map.tags.has('normal') ? 2 : 1
        record.ratingDiff = window.getRating(record.time, wr.time, record.placement, records.size, difficulty, record)
        record.player.rating += record.ratingDiff
        // record.ratingDiff2 = Math.round(k1 * k2 * pts)
        // record.player.rating2 += record.ratingDiff2
      }
    }
  }
  console.timeEnd('⏳ calculating ratings')
}

export function calculcatePhysics() {
  console.time('⏳ calculating physics stats')
  for (const [playerId, player] of playersById.value) {
    const physicsStats = { race: 0, vintage: 0, diabotical: 0 }
    for (const [recordId, record] of player.records) {
      physicsStats[record.physicsId]++
    }
    player.bestPhysics = physicsStats.diabotical > physicsStats.vintage && physicsStats.diabotical > physicsStats.race ? 'diabotical' : physicsStats.vintage > physicsStats.race && physicsStats.vintage > physicsStats.diabotical ? 'vintage' : 'race'
  }

  for (const [mapId, physicsByVersion] of runsByGroups.value) {
    const map = mapsById.value.get(mapId) as TMap
    map.defaultPhysics = getDefaultMapPhysics(map)
  }
  console.timeEnd('⏳ calculating physics stats')
}

// Check

export function isPlayerHidden(player: TPlayer) {
  if (!player.name) {
    return 1
  }
  return 0
}

export function isMapHidden(map: TMap) {
  for (const tagId of filter.tagIds) {
    if (!map.tags.has(tagId)) {
      return 1
    }
  }
  for (const authorId of filter.authorIds) {
    if (!map.authors.has(authorId)) {
      return 1
    }
  }
  return 0
}

export function isRunHidden(run: TRun) {
  if (filter.playerId && filter.playerId !== run.playerId) {
    return 1
  }
  if (filter.runsSearch && !includeString(run.player.name, filter.runsSearch) && !includeString(run.map.name, filter.runsSearch)) {
    return 1
  }
  for (const tagId of filter.tagIds) {
    if (!run.map.tags.has(tagId)) {
      return 1
    }
    for (const physicsId of physicsIds) {
      if (tagId === physicsId && run.physicsId !== physicsId) {
        return 1
      }
    }
  }
  for (const authorId of filter.authorIds) {
    if (!run.map.authors.has(authorId)) {
      return 1
    }
  }
  // if (run.obsolete) {
  //   return 1
  // }
  return 0
}

export function isAuthorHidden(author: TAuthor) {
  const authorIds = new Set()
  // if (filter.playerId && !author.players.has(filter.playerId)) {
  //   return 1
  // }
  return 0
}

export function isTagHidden(tag: TTag) {
  // if (filter.playerId && !tag.players.has(filter.playerId)) {
  //   return 1
  // }
  return 0
}

// Create

export function createPhysics(physicsId: TPhysicsId): TPhysics {
  const newPhysics = {
    id: physicsId,
    records: new Map(),
    runs: new Map(),
    players: new Map(),
    maps: new Map(),
  }
  physicsById.value.set(physicsId, newPhysics)
  return newPhysics
}

export function createMap(map: TMap): TMap {
  if (mapsById.value.has(map.id)) {
    return mapsById.value.get(map.id) as TMap
  }

  const day = createDay(map.since)

  const physicsIds = [] as TPhysicsId[]
  const until = map.until || ''
  const rules = map.rules || []
  const dayId = map.since.substring(0, 10)
  const image = `https://quakelife.ru/diabotical/maps/img/thumbnails/${map.id}.webp`

  if (dayId > getDay('', -7)) {
    map.tagNames.unshift('new')
  }

  if (map.until) {
    map.tagNames.unshift('archived')
  }

  if (!map.tagNames.includes('official')) {
    map.tagNames.unshift('community')
  }

  if (map.tagNames.includes('diabotical')) {
    physicsIds.unshift('diabotical')
  }

  if (map.tagNames.includes('vintage')) {
    physicsIds.unshift('vintage')
  }

  if (map.tagNames.includes('race')) {
    physicsIds.unshift('race')
  }

  if (!map.tagNames.includes('race') && !map.tagNames.includes('vintage') && !map.tagNames.includes('diabotical')) {
    physicsIds.unshift('race', 'vintage', 'diabotical')
    map.tagNames.unshift('race', 'vintage', 'diabotical')
  }

  const defaultPhysics = physicsIds[0]

  const tags = new Map(
    map.tagNames.map((tagName) => {
      const newTag = createTag(tagName)
      return [newTag.id, newTag]
    })
  )

  const authors = new Map(
    map.authorNames.map((authorName) => {
      const newAuthor = createAuthor(authorName)
      return [newAuthor.id, newAuthor]
    })
  )

  const newMap = {
    ...map,
    physicsIds,
    rules,
    until,
    // computed
    hidden: 0,
    faded: 0,
    image,
    defaultPhysics,
    dayId,
    icons: {},
    // links
    tags,
    authors,
    newRuns: new Map(),
    runs: new Map(),
    records: new Map(),
    players: new Map(),
  }

  mapsById.value.set(map.id, newMap)
  day.newMaps.set(map.id, newMap)
  return newMap
}

export function createPlayer(player: Partial<TPlayer>): TPlayer {
  const playerId = player.id || `${player.flag}_${player.name}`.toLowerCase()
  if (playersById.value.has(playerId)) {
    return playersById.value.get(playerId) as TPlayer
  }
  const newPlayer = {
    id: playerId,
    twitchId: 0,
    twitchName: '',
    twitchFollowers: 0,
    ...player,
    // computed
    hidden: 0,
    faded: 0,
    active: false,
    mine: false,
    bestPhysics: 'race' as TPhysicsId,
    rating: 0,
    medals: [0, 0, 0, 0],
    maps: new Map(),
    runs: new Map(),
    records: new Map(),
    players: new Map(),
  } as TPlayer
  playersById.value.set(playerId, newPlayer)
  return newPlayer
}

export function createRun(run: TRun): TRun {
  const id = run.mapId + '_' + run.name + '_' + run.time // replace to run.id after removing duplicates
  const playerId = run.playerId || `${run.flag}_${run.name}`.toLowerCase()
  const dayId = (run.datetime || new Date().toISOString()).substring(0, 10)
  const icons = { ...(run.icons || {}) }
  const newRun = {
    ...run,
    id,
    playerId,
    dayId,
    icons,
    obsolete: 'ban red' in icons,
    timeDiff: 0,
    ratingDiff: 0,
    placement: 1,
    placementDiff: 0,
    hidden: 0,
    faded: 0,
    wr: false,
    pb: false,
    new: false,
    day: createDay(dayId),
    player: createPlayer({ name: run.name, flag: run.flag }),
    map: mapsById.value.get(run.mapId) as TMap,
    physics: physicsById.value.get(run.physicsId) as TPhysics,
  }
  for (const icon in newRun.icons) {
    if (!iconsById.value.has(icon)) {
      iconsById.value.set(icon, newRun.icons[icon])
    }
  }
  runsById.value.set(id, newRun)
  return newRun
}

export function createTag(tagName: string): TTag {
  const tagId = tagName.toLowerCase()
  if (tagsById.value.has(tagId)) {
    return tagsById.value.get(tagId) as TTag
  }
  const newTag = {
    id: tagId,
    icon: 'tag',
    color: '#678',
    group: 10,
    custom: true,
    auto: false,
    ...(tagsDataById[tagId] || {}),
    name: tagName,
    hidden: 0,
    faded: 0,
    active: false,
    maps: new Map(),
    players: new Map(),
    records: new Map(),
    runs: new Map(),
  }
  tagsById.value.set(tagId, newTag)
  return newTag
}

export function createAuthor(authorName: string): TAuthor {
  const authorId = authorName.toLowerCase()
  if (authorsById.value.has(authorId)) {
    return authorsById.value.get(authorId) as TAuthor
  }
  const newAuthor = {
    id: authorId,
    name: authorName,
    hidden: 0,
    faded: 0,
    active: false,
    maps: new Map(),
    players: new Map(),
    records: new Map(),
    runs: new Map(),
  }
  authorsById.value.set(authorId, newAuthor)
  return newAuthor
}

export function createDay(daytime: TDayId) {
  const dayId = daytime.substring(0, 10)
  if (daysById.value.has(dayId)) {
    return daysById.value.get(dayId) as TDay
  }
  const newDay = {
    id: dayId,
    runs: new Map(),
    players: new Map(),
    maps: new Map(),
    newMaps: new Map(),
    hidden: 0,
    active: false,
  }
  daysById.value.set(dayId, newDay)
  return newDay
}

// Load

export async function updateData() {
  try {
    console.time('⏳ loading new data')
    updating.value++
    // data.value = await fetch(`https://quakelife.ru/diabotical/race/data.json`).then((res) => res.json())
    data.value = await getData()
    // if (data.value.runs.length < 20000) {
    //   storage.value.data = { ...data.value, runs: data.value.runs.slice(0, 20000) }
    // }
  } catch (error) {
    console.warn(`Can't load new data`, error)
  } finally {
    updating.value--
    console.timeEnd('⏳ loading new data')
  }
}

// Calculate

export function getDefaultMapPhysics(map: TMap) {
  const currentPlayersByPhysics = recordsByGroups.value.get(map.id)?.get(map.version) || new Map<TPhysicsId, Map<TPlayerId, TRun>>()

  if (config.defaultPhysics !== 'auto' && map.physicsIds.includes(config.defaultPhysics)) {
    return config.defaultPhysics
  }

  let maxRecords = 0
  let maxNewRecords = 0
  let maxRecordsPhysics = map.physicsIds[0]
  let maxNewRecordsPhysics = map.physicsIds[0]

  if (!map.runs.size) {
    return maxRecordsPhysics
  }

  for (const [physicsId, recordsByPlayer] of currentPlayersByPhysics) {
    if (recordsByPlayer.has(filter.playerId)) {
      return physicsId
    }

    if (filter.tagIds.has('race')) {
      return 'race'
    } else if (filter.tagIds.has('vintage')) {
      return 'vintage'
    } else if (filter.tagIds.has('diabotical')) {
      return 'diabotical'
    }

    let recordsCount = 0
    let newRecordsCount = 0
    for (const [playerId, record] of recordsByPlayer) {
      if (record && record.dayId <= filter.dayId) {
        recordsCount++
        if (record.new) {
          newRecordsCount++
        }
      }
    }

    if (recordsCount > maxRecords) {
      maxRecords = recordsCount
      maxRecordsPhysics = physicsId
    }

    if (newRecordsCount > maxNewRecords) {
      maxNewRecords = newRecordsCount
      maxNewRecordsPhysics = physicsId
    }
  }

  if (config.mapsSort === 'New runs' && maxNewRecords) {
    return maxNewRecordsPhysics
  }

  if (config.mapsSort === 'Count of runs' && maxRecords) {
    return maxRecordsPhysics
  }

  for (const [physicsId, runsByPlayer] of currentPlayersByPhysics) {
    if (runsByPlayer.has(userId.value)) {
      return physicsId
    }
  }

  return maxRecordsPhysics
}

export function isNew(dayId: TDayId) {
  return
}
