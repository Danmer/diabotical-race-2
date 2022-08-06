declare module '*.vue' {
  import { DefineComponent, Ref } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

type TObject = Record<string, unknown>
type TObjectsById<T = TObject> = Record<string, T[]>
type TDatetime = string

type TDayId = string
type TRunId = string
type TPlayerId = string
type TMapId = string
type TTagId = string
type TAuthorId = string
type TStreamId = number
type TPhysicsId = 'race' | 'vintage' | 'diabotical'

interface TUrlParams {
  day: string
  player: string
  map: string
  tags: string | Array<string>
  authors: string | Array<string>
  sortPlayers: string
  sortMaps: string
  // 'tags.ids'?: string
  // 'tags.search'?: string
  // 'authors.ids'?: string
  // 'authors.search'?: string
  // 'runs.search'?: string
  // 'maps.search'?: string
  // 'maps.sort'?: string
  // 'players.search'?: string
  // 'players.sort'?: string
  // 'players.id'?: TPlayerId
}

interface TFilter {
  dayId: TDayId
  runsSearch: string
  mapsSearch: string
  playersSearch: string
  playerId: TPlayerId
  playerOpposite: boolean
  tagsSearch: string
  authorsSearch: string
  tagIds: Set<TTagId>
  authorIds: Set<TAuthorId>
}

// Data

interface TData {
  maps: TMap[]
  runs: TRun[]
  players: TPlayer[]
  runRules: string[]
  mapRules: string[]
  eggcupRules: string[]
  eggcups: TEggcup[]
  cup: { date: string; image: string; link: string }
  presets: { id: string; physics: string; type: string; name: string }[]
}

interface TRun {
  approved: boolean
  mapId: TMapId
  version: number
  physicsId: TPhysicsId
  time: number
  video: string
  flag: string
  name: string
  icons: Record<string, string>
  datetime: TDatetime
  replacer?: string
  eggcup?: string
  verified: boolean | undefined
  // computed
  id: TRunId
  dayId: TDayId
  playerId: TPlayerId
  timeDiff: number
  ratingDiff: number
  placement: number
  placementDiff: number
  obsolete: boolean // if icons has ban red
  // state
  hidden: number
  active: boolean
  mine: boolean
  pb: boolean
  wr: boolean
  new: boolean
  // links
  map: TMap
  player: TPlayer
  day: TDay
  physics: TPhysics
}

interface TMap {
  approved: boolean
  id: TMapId
  name: string
  version: number
  since: TDatetime
  until: TDatetime
  authorNames: string[]
  tagNames: string[]
  physicsIds: TPhysicsId[]
  rules: string[]
  contacts: string
  // computed
  hidden: number
  faded: number
  dayId: TDayId
  defaultPhysics: TPhysicsId
  image: string
  icons: Record<string, string>
  // links
  newRuns: Map<TRunId, TRun>
  runs: Map<TRunId, TRun>
  records: Map<TRunId, TRun>
  players: Map<TPlayerId, TPlayer>
  tags: Map<TTagId, TTag>
  authors: Map<TAuthorId, TAuthor>
}

interface TPlayer {
  id: TPlayerId
  flag: string
  name: string
  epicId: string
  twitchId: number
  twitchName: string
  twitchFollowers: number
  // computed
  hidden: number
  faded: number
  active: boolean
  mine: boolean
  bestPhysics: TPhysicsId
  rating: number
  medals: number[]
  placement: number
  // links
  stream: TStream | null
  maps: Map<TMapId, TMap>
  runs: Map<TRunId, TRun>
  records: Map<TRunId, TRun>
  players: Map<TMapId, TMap>
}

interface TTag {
  name: string
  // computed
  id: string
  color: string
  icon: string
  hidden: number
  faded: number
  active: boolean
  group: number
  custom: boolean
  auto: boolean
  // links
  maps: Map<TMapId, TMap>
  players: Map<TPlayerId, TPlayer>
  records: Map<TRunId, TRun>
  runs: Map<TRunId, TRun>
}

interface TAuthor {
  name: string
  // computed
  id: string
  hidden: number
  faded: number
  active: boolean
  // links
  maps: Map<TMapId, TMap>
  players: Map<TPlayerId, TPlayer>
  records: Map<TRunId, TRun>
  runs: Map<TRunId, TRun>
}

interface TPhysics {
  id: TPhysicsId
  records: Map<TRunId, TRun>
  runs: Map<TRunId, TRun>
  players: Map<TPlayerId, TPlayer>
  maps: Map<TMapId, TMap>
}

interface TDay {
  id: TDayId
  runs: Map<TRunId, TRun>
  players: Map<TPlayerId, TPlayer>
  maps: Map<TMapId, TMap>
  newMaps: Map<TMapId, TMap>
  hidden: number
  active: boolean
}

interface TEggcup {
  id: string
  mapId: string
  datetime: TDatetime
  runs: TRun[]
  presetRace: string
  presetVintage: string
  presetDiabotical: string
  rules: string[]
}

interface TPreset {
  id: string
  physics: string
  type: string
  name: string
}

// UI

interface TModal {
  name: string
  visible: boolean
  active: boolean
  closing: boolean
  opening: boolean
  data: any
  open(data?: any): void
  close(): void
}

interface TCollapser {
  active: boolean
  visible: boolean
  closing: boolean
  opening: boolean
  open(): void
  close(): void
  toggle(): void
}

interface TDropdown {
  active: boolean
  closing: boolean
  opening: boolean
  open(): void
  close(): void
  toggle(): void
}

interface TInput {
  value: string
  backup: string
  focused: boolean
  changed: boolean
  new: boolean
  clearable: boolean
  lowercase: boolean
  mask?: string[]
  focus(): void
  select(): void
  set(newValue: string): void
  clear(): void
}

type TSelect = TInput & TDropdown

// Stream

interface TChannel {
  id: number
  name: string
  description: string
  language: string
  partner: boolean
  logo: string
  views: number
  followers: number
  avatar: string
}

interface TStream {
  id: TStreamId
  game: string
  viewers: number
  quality: number
  delay: number
  startedAt: string
  preview: string
  title: string
  viewersBefore: string
  channel: TChannel
}

interface TStreamsData {
  updatedAt: string
  streams: TStream[]
}

interface TMapsData {
  authors: {
    id: string
    name: string
  }[]
  maps: {
    id: string
    name: string
    modeIds: string[]
    authorId: string
    updated: string
    revision: number
    reviewed: true
    thumbnail: true
    // computed
    author: string
  }[]
}
