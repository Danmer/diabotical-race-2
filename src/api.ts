import { config } from './store/config'
import { token } from './store/storage'

// Data

export async function getData() {
  return await fetch(`${config.api}/data.json`).then((res) => res.json() as Promise<TData>)
}

export async function getStreams() {
  return await fetch(`https://quakelife.ru/diabotical/streamers/streams.json`).then((res) => res.json() as Promise<TStreamsData>)
}

export async function getMaps() {
  return await fetch(`https://quakelife.ru/diabotical/maps/data/last.min.json`).then((res) => res.json() as Promise<TMapsData>)
}

export async function verifyRun(epicShortId: string, mapId: string, time: number, presetId: string, token: string) {
  return await fetch(`https://api.diabotical.com/api/v0/diabotical/app/verify_race_time/?preset_id=${presetId}&map=${mapId}&user_id=${epicShortId}&time=${time}&token=${token}`).then((res) => res.json())
}

// Submit

export async function submitRun(newRun: Partial<TRun>) {
  // console.log('Submitting run', runData)
  console.time('⏳ submitting run')
  return fetch(`${config.api}/submit-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newRun }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ submitting run')
    })
}

export async function submitMap(newMap: Partial<TMap>) {
  // console.log('Submitting map', mapData)
  console.time('⏳ submitting map')
  return fetch(`${config.api}/submit-map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newMap }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ submitting map')
    })
}

// Admin

export async function saveRun(runData: Partial<TRun> = {}) {
  console.time('⏳ saving run')
  return fetch(`${config.api}/save-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runData, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ saving run')
    })
}

export async function deleteRun(runData: { datetime: string; eggcup: string | undefined }) {
  console.time('⏳ deleting run')
  return fetch(`${config.api}/delete-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runData, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ deleting run')
    })
}

export async function saveMap(mapId: TMapId, mapData: Partial<TMap>) {
  console.time('⏳ saving map')
  return fetch(`${config.api}/save-map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mapId, mapData, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ saving map')
    })
}

export async function deleteMap(mapId: TMapId) {
  console.time('⏳ deleting map')
  return fetch(`${config.api}/delete-map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mapId, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ deleting map')
    })
}

export async function savePlayer(playerData: Partial<TPlayer>) {
  console.time('⏳ saving player')
  return fetch(`${config.api}/save-player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerData, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ saving player')
    })
}

export async function reviewEggcup(eggcupId: string) {
  console.time('⏳ getting eggcup')
  return fetch(`${config.api}/review-eggcup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eggcupId, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ getting eggcup')
    })
}

export async function saveEggcup(eggcupData: Partial<TEggcup>) {
  console.time('⏳ saving eggcup')
  return fetch(`${config.api}/save-eggcup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eggcupData, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ saving eggcup')
    })
}

export async function publishEggcup(eggcupId: string) {
  console.time('⏳ publishing eggcup')
  return fetch(`${config.api}/publish-eggcup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eggcupId, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ publishing eggcup')
    })
}

export async function deleteEggcup(eggcupId: string) {
  console.time('⏳ deleting eggcup')
  return fetch(`${config.api}/delete-eggcup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eggcupId, token: token.value }),
  })
    .then((res) => res.json())
    .finally(() => {
      console.timeEnd('⏳ deleting eggcup')
    })
}

export async function verifyAndSaveRun(runData: Partial<TRun>, epicShortId = '', presetId = '', token = ''): Promise<boolean | null> {
  const mapId = runData.mapId
  const time = runData.time
  const runToken = (token || window.prompt('Token') || '').substring(0, 20)
  epicShortId = (epicShortId || window.prompt('Short Player ID (5 symbols)') || '').substring(0, 5)
  presetId = (presetId || window.prompt('Preset ID') || '').substring(0, 36)
  if (mapId && time && runToken.length === 20 && epicShortId.length === 5 && presetId.length === 36) {
    const response = await verifyRun(epicShortId, mapId, time, presetId, runToken)
    runData.verified = response.success
    await saveRun(runData)
    // if (response.success === false && window.confirm(`The token is invalid! Do you want to check it in a new window?`)) {
    //   window.open(`https://api.diabotical.com/api/v0/diabotical/app/verify_race_time/?user_id=${epicShortId}&map=${mapId}&time=${time}&token=${runToken}&preset_id=${presetId}`, 'verify_race_time')
    // }
    return response.success
  } else {
    console.warn('Wrong data', { runToken, epicShortId, mapId, time, presetId })
    return null
  }
}
