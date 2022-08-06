import { languages } from './store'
import { daysById, tags } from './store/data'
import { token } from './store/storage'
import { modalVideo } from './store/ui'

// export function generateId(length = 24) {
//   let id = ''
//   for (var i = 0; i < length; i++) {
//     id += ((Math.random() * 16) | 0).toString(16)
//   }
//   return id
// }

export async function asyncTimeout(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

export function generateId() {
  return 'id' + Math.random()
}

export function uniq(array: string[]) {
  return [...new Set(array)]
}

export function uniqById(array: Record<string, any>[]) {
  const arrayById = {} as Record<string, any>
  for (const item of array) {
    arrayById[item.id] = item
  }
  return Object.values(arrayById)
}

export function clone<T = {}>(object: T): T {
  return JSON.parse(JSON.stringify(object))
}

export function sortMap<T = any, R = any>(map: Map<T, R>, compareFn: (a: [any, any], b: [any, any]) => number): Map<T, R> {
  return new Map([...map.entries()].sort(compareFn))
}

// export function keyBy<T>(array: T[], key: keyof T = 'id'): Record<string, T> {
//   try {
//     return array.reduce((object, item) => ({ ...object, [`${item[key]}`]: item }), {})
//   } catch (error) {
//     console.warn(error)
//     return {}
//   }
// }

// export function groupBy<T>(array: T[], key: keyof T = 'id'): TObjectsById<T> {
//   try {
//     return array.reduce((object, item) => {
//       const value = item[key] as string
//       return { ...object, [value]: object[value] ? object[value].concat(item) : [item] }
//     }, {} as TObjectsById<T>)
//   } catch (error) {
//     console.warn(error)
//     return {}
//   }
// }

export function copyText(text: string) {
  return navigator.clipboard.writeText(text)
}

export async function copyAndHighlight(text: string, event: MouseEvent) {
  let statusColor = '#6B7280'
  try {
    await copyText(text)
    statusColor = '#10B981'
  } catch (error) {
    console.warn(error)
    statusColor = '#EF4444'
  }
  const target = event.target as HTMLElement
  if (target) {
    target.style.color = statusColor
    setTimeout(() => {
      target.style.color = ''
    }, 200)
  }
}

export function getDiffClass(value: number) {
  return value > 0 ? 'plus text-green-500' : value < 0 ? 'text-red-500' : 'hidden'
}

export function nextValue(variable: any, array: any[] = []) {
  const index = array.indexOf(variable)
  if (index === -1 || index === array.length - 1) {
    variable = array[0]
  } else {
    variable = array[index + 1]
  }
  return variable
}

export function stringToMs(string: string) {
  const stringArray = [...string].reverse()
  const milliseconds = parseInt((stringArray[2] || '0') + (stringArray[1] || '0') + (stringArray[0] || '0'))
  let seconds = 0
  let minutes = 0
  let hours = 0
  if (string.includes('.')) {
    seconds = parseInt((stringArray[5] || '0') + (stringArray[4] || '0'))
    minutes = parseInt((stringArray[8] || '0') + (stringArray[7] || '0'))
    hours = parseInt((stringArray[11] || '0') + (stringArray[10] || '0'))
  } else {
    seconds = parseInt((stringArray[4] || '0') + (stringArray[3] || '0'))
    minutes = parseInt((stringArray[6] || '0') + (stringArray[5] || '0'))
    hours = parseInt((stringArray[8] || '0') + (stringArray[7] || '0'))
  }
  // console.log(string, { hours, minutes, seconds, milliseconds })
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds
}

export function getDay(date?: string, diff: number = 0): TDayId {
  if (!diff && date) {
    return date.substring(0, 10)
  }
  // toUpperCase date for Firefox?
  const time = date ? new Date(date).getTime() : Date.now()
  return new Date(time + diff * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
}

export function compareStrings(a: string, b: string) {
  return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

export function prettyDay(date: string | Date) {
  const locales = languages.value.concat()
  const dateObject = new Date(date)
  const isCurrentYear = dateObject.getFullYear() === new Date().getFullYear()
  return new Intl.DateTimeFormat(locales, { year: isCurrentYear ? undefined : 'numeric', month: 'long', day: 'numeric' }).format(dateObject)
}

export function prettyDate(date: string | Date) {
  const locales = languages.value.concat()
  const dateObject = new Date(date)
  return new Intl.DateTimeFormat(locales, { dateStyle: 'medium' }).format(dateObject).replace(' г.', '')
  // return dateObject.getDate() + ' ' + new Intl.DateTimeFormat(locales, { month: 'short' }).format(dateObject) + ' ' + dateObject.getFullYear()
}

export function prettyTime(datetime: number, options = { ms: true }) {
  const time = Math.abs(datetime)
  const d = Math.floor(time / 86400000)
  const htime = time - d * 86400000
  const h = Math.floor(htime / 3600000)
  const mtime = time - d * 86400000 - h * 3600000
  const m = Math.floor(mtime / 60000)
  const stime = time - d * 86400000 - h * 3600000 - m * 60000
  const s = Math.floor(stime / 1000)
  const ms = time - d * 86400000 - h * 3600000 - m * 60000 - s * 1000
  return (
    (datetime < 0 ? '-' : '') + //
    (d ? `${d}D ` : '') +
    (d || h ? `${h}:` : '') +
    (d || h || m ? `${m}:`.padStart(d || h ? 3 : 2, '0') : '') +
    `${s}`.padStart(d || h || m ? 2 : 1, '0') +
    (options.ms ? '.' + `${ms}`.padStart(3, '0') : '')
  )
}

export function prettyNumber(value: number) {
  if (value < 1000) {
    return value.toFixed(0)
  }
  // console.log('prettyNumber')
  const suffixes = ['', 'k', 'm', 'b', 't']
  const suffixNum = Math.floor(('' + value).length / 4)
  const suffix = suffixes[suffixNum]
  const shortValue = parseFloat((suffixNum != 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(2))
  const stringValue = shortValue % 1 != 0 || (shortValue < 10 && suffix) ? shortValue.toFixed(1) : shortValue.toFixed(0)
  return stringValue + suffix
}

export function prettyDuration(s: number) {
  const m = Math.round(s / 60)
  const mr = s % 60
  const h = Math.round(m / 60)
  const hr = m % 60
  const d = Math.round(h / 24)
  const dr = h % 24
  return (!dr && d === 1) || d > 1 ? `${d}d` : (!hr && h === 1) || h > 1 ? `${h}h` : (!mr && m === 1) || m > 1 ? `${m}m` : s > 1 ? `${s}s` : 0
}

export function prettyPhysics(physics: string) {
  return physics.replace('diabotical', 'dbt').replace('vintage', 'vint')
}

export function getEmbedLink(url: string) {
  const hostname = location.hostname
  const matchYoutube = url.match(/((youtube\.com\/watch\?v=([^&]+))|(youtu\.be\/([^?]+)))((&|\?)t=(\d+)(.*))?/)
  const matchStreamable = url.match(/streamable\.com\/([^&?/]+).*/i)
  const matchTwitchClip = url.match(/twitch\.tv\/.+\/clip\/([^&?/]+).*/i) // https://www.twitch.tv/rollipollipotamus/clip/BusySarcasticSquidYouDontSay
  const matchTwitchClip2 = url.match(/clips\.twitch\.tv\/([^&?/]+).*/i) // https://clips.twitch.tv/AthleticKindShallotTebowing
  const matchTwitchVideo = url.match(/twitch\.tv\/videos\/(\d+).*/i) // https://www.twitch.tv/videos/867275470
  if (matchYoutube) {
    return `https://www.youtube.com/embed/${matchYoutube[3] || matchYoutube[5]}?autoplay=1&start=${matchYoutube[8] || 0}`
  } else if (matchStreamable) {
    return `https://streamable.com/o/${matchStreamable[1]}?autoplay=1`
  } else if (matchTwitchClip) {
    return `https://clips.twitch.tv/embed?clip=${matchTwitchClip[1]}&parent=${hostname}&autoplay=true`
  } else if (matchTwitchClip2) {
    return `https://clips.twitch.tv/embed?clip=${matchTwitchClip2[1]}&parent=${hostname}&autoplay=true`
  } else if (matchTwitchVideo) {
    return `https://player.twitch.tv/?parent=${hostname}&video=${matchTwitchVideo[1]}&autoplay=true`
  }
  return ''
}

export function openVideo(url: string, $event: Event) {
  const embedLink = getEmbedLink(url)
  if (embedLink) {
    $event.preventDefault()
    modalVideo.open({ video: url })
  }
}

export function openRun(run: TRun, $event: Event) {
  if (!run.approved && !token.value) {
    return
  }
  const embedLink = getEmbedLink(run.video)
  if (embedLink) {
    $event.preventDefault()
    modalVideo.open(run)
  }
}

export function getComparableString(name: string) {
  return (
    name
      // variants
      .toLowerCase()
      .replace(/\|/g, '\\|')
      .replace(/o|0|🅾/gi, '(o|0|🅾)')
      .replace(/i|l|1/gi, '(i|l|1)')
      .replace(/e|3/gi, '(e|3)')
      .replace(/a|4|🅰/gi, '(a|4|🅰)')
      .replace(/s|5/gi, '(s|5)')
      .replace(/b|6|🅱/gi, '(b|6|🅱)')
      .replace(/p|🅿/gi, '(p|🅿)')
      .replace(/_/gi, '(_|)')
  )
}

export function includeString(string: string, substring: string) {
  return getComparableString(string).includes(getComparableString(substring))
}

export function createDayReport(datetime = new Date().toISOString()) {
  const day = daysById.value.get(getDay(datetime)) as TDay
  const runs = [...day?.runs.values()].filter((run) => run.approved)
  const newMaps = [...day?.newMaps.values()].filter((map) => map.approved)

  const runsReports = runs.map((run) => `> ${run.map.name} [${run.physicsId}] ${prettyTime(run.time)} - ${run.name}` + (run.wr ? ' :first_place:' : run.placement === 2 ? ' :second_place:' : run.placement === 3 ? ' :third_place:' : '') + (run.icons['bug red'] ? ' :rampbug:' : ''))
  const mapsReports = newMaps.map(
    (map) =>
      `> ${map.name} by ${map.authorNames.join(', ')} [${map.physicsIds.join(', ')}] - ${[...map.tags.values()]
        .filter((tag) => tag.group > 9 || tag.group === 2 || tag.group === 8)
        .map((tag) => tag.name)
        .join(', ')}`

    // `> ${map.name} by ${map.authorNames.join(', ')} [${[...map.tags.values()]
    //   .filter((tag) => tag.group > 9 || tag.group === 2 || tag.group === 8)
    //   .map((tag) => tag.name)
    //   .join(', ')}]` +
    // (map.tags.has('race') ? ' :race:' : '') +
    // (map.tags.has('vintage') ? ' :vint:' : '') +
    // (map.tags.has('diabotical') ? ' :dbt:' : '')

    // `${map.tags.has('race') ? ' :race:' : map.tags.has('vintage') ? ' :vint:' : map.tags.has('diabotical') ? ' :dbt:' : ''}`+
    //  `${map.tags.has('easy') ? ' :easy:' : map.tags.has('normal') ? ' :normal:' : map.tags.has('hard') ? ' :hard:' : ''}`
  )
  const mapsImages = newMaps.map((map) => map.image)

  runsReports.sort()

  const report = '**' + prettyDate(datetime) + '**\n' + (runsReports.length ? `\n**${runsReports.length} approved runs**:\n` + runsReports.join('\n') : '\nNo runs') + '\n\n' + (mapsReports.length ? `**${mapsReports.length} added maps**:\n` + mapsReports.join('\n') + '\n' + mapsImages.join('\n') : '')

  console.log(report)
  copyText(report)
}

export function createEggcupReport(eggcup: TEggcup) {
  eggcup.runs.sort((run1, run2) => ['race', 'vintage', 'diabotical'].indexOf(run1.physicsId) || (run2.time > run1.time ? -1 : run2.time < run1.time ? 1 : run1.datetime > run2.datetime ? 1 : -1))
  const report = eggcup.runs
    .map((run) => {
      return run.datetime.substring(0, 19).replace('T', ' ') + '\t' + run.name + '\t' + run.physicsId + '\t' + prettyTime(run.time) + '\t' + run.video
    })
    .join('\n')

  console.log(report)
  copyText(report)
}
