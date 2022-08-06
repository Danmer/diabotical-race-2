<template>
  <div class="relative w-full max-w-md m-auto text-gray-100 transition-all duration-300 bg-gray-800 rounded-lg" @click.stop>
    <h3 class="mt-6 text-3xl font-extrabold text-center">Map Submission</h3>

    <form class="flex flex-col p-6 space-y-6" :class="{ 'pointer-events-none opacity-25': success }">
      <!-- <div class="p-3 font-bold text-center text-yellow-100 bg-yellow-900 rounded">Only for map authors!</div> -->

      <fieldset class="flex flex-col space-y-4">
        <div class="relative flex space-x-2">
          <div class="relative flex-1">
            <!-- Map -->
            <UiSelect :select="mapSelect" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="map" spellcheck="false" required :disabled="data.id" @blur="mapSelect.value = currentMap ? mapSelect.value : mapSelect.backup">
              <template v-slot:input-right>
                <UiThumbnail v-if="currentMap" :map="currentMap" class="w-16 h-8" />
              </template>
              <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm bg-gray-700" style="max-height: 14rem">
                <div v-for="map in autocompletedMaps" :key="map.id" class="flex items-center p-2 cursor-pointer row" @mousedown="selectMap(map.name, map.author)">
                  <UiThumbnail class="w-16 h-8 mr-2 -my-1" :map="map" />
                  <div class="flex-1 -my-1">
                    {{ map.name }}
                    <div class="!leading-4 text-xs text-gray-400">by {{ map.author }}</div>
                  </div>
                  <div class="-my-1 text-xs text-right">
                    rev. {{ map.revision }}
                    <div class="!leading-4 text-gray-400">{{ prettyDate(map.updated) }}</div>
                  </div>
                </div>
              </UiList>
            </UiSelect>
          </div>

          <!-- Version -->
          <div v-if="token" class="relative w-16 ml-2">
            <UiInput :input="versionInput" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="ver" />
          </div>
        </div>

        <!-- Authors -->
        <div class="relative flex flex-wrap flex-1 px-2 pt-1 bg-gray-700 rounded cursor-text" :class="{ 'bg-gray-600': authorSelect.active }">
          <UiSelect :select="authorSelect" class="flex-1 p-1 mb-1 min-w-[4.5rem]" placeholder="authors" spellcheck="false" required @blur="authorSelect.clear()">
            <template v-slot:input-left>
              <div v-for="author in selectedAuthors" :key="author" class="flex items-center p-2 mb-1 mr-1 text-sm bg-gray-800 rounded">
                <i class="mr-2 text-gray-600 fa fa-user" />
                {{ author }}
                <i class="ml-3 text-gray-700 cursor-pointer hover:text-red-600 fa fa-times" @click="selectedAuthors.delete(author)" />
              </div>
            </template>
            <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm bg-gray-700" style="max-height: 14rem">
              <div class="relative">
                <div v-if="isNewAuthor" key="new-author" class="sticky top-0 flex items-center p-2 cursor-pointer row" @mousedown="addAuthor(authorSelect.value)">
                  <i class="mr-2 text-gray-500 fa fa-user" />
                  <span class="flex-1">{{ authorSelect.value }}</span>
                  <span class="p-1 text-[0.7em] uppercase font-bold text-green-500">new</span>
                </div>
                <div v-for="author in autocompletedAuthors" :key="author.id" class="flex items-center p-2 cursor-pointer row" @mousedown="addAuthor(author.name)">
                  <i class="mr-2 text-gray-500 fa fa-user" />
                  {{ author.name }}
                </div>
              </div>
            </UiList>
          </UiSelect>
        </div>

        <!-- Tags -->
        <div class="relative flex-1 px-2 pt-1 bg-gray-700 rounded cursor-text" :class="{ 'bg-gray-600': tagSelect.active }">
          <UiSelect :select="tagSelect" class="flex-1 p-1 mb-1 min-w-[4.5rem]" placeholder="tags" spellcheck="false" required @blur="tagSelect.clear()">
            <template v-slot:input-left>
              <div v-for="tag in selectedTags" :key="tag" class="flex items-center p-2 mb-1 mr-1 text-sm bg-gray-800 rounded">
                <i class="mr-2 text-gray-600 fa fa-tag" />
                {{ tag }}
                <i class="ml-2 text-gray-700 cursor-pointer hover:text-red-600 fa fa-times" @click="selectedTags.delete(tag)" />
              </div>
            </template>
            <UiList :count="30" :animation="null" class="overflow-y-scroll text-sm bg-gray-700" style="max-height: 14rem">
              <div class="relative">
                <div v-if="isNewTag" key="new-tag" class="sticky top-0 flex items-center p-2 cursor-pointer row" @mousedown="addTag(tagSelect.value)">
                  <i class="mr-2 text-gray-500 fa fa-tag" />
                  <span class="flex-1">{{ tagSelect.value }}</span>
                  <span class="p-1 text-[0.7em] uppercase font-bold text-green-500">new</span>
                </div>
                <div v-for="tag in autocompletedTags" :key="tag.id" class="flex items-center p-2 cursor-pointer row" @mousedown="addTag(tag.name)">
                  <i class="mr-2 text-gray-500 fa fa-tag" :style="{ color: tag.color }" />
                  {{ tag.name }}
                </div>
              </div>
            </UiList>
          </UiSelect>
        </div>

        <!-- Physics -->
        <div class="flex overflow-hidden text-sm font-bold uppercase divide-x divide-black rounded select-none divide-opacity-25">
          <div v-for="[physicsId, physics] of physicsById" :key="physicsId" class="flex items-center justify-center flex-auto p-3 cursor-pointer hover:bg-gray-900" :class="selectedPhysics.has(physicsId) ? 'bg-gray-900' : 'bg-gray-700 text-gray-500'" @click="selectedPhysics.has(physicsId) ? selectedPhysics.delete(physicsId) : selectedPhysics.add(physicsId)">
            <i class="hidden mr-3 -my-1 text-lg opacity-50 fa fa-fw sm:inline-block" :class="selectedPhysics.has(physicsId) ? `fa-${tagsById.get(physicsId)?.icon} text-green-400` : 'fa-ban'" />
            {{ physicsId }}
          </div>
        </div>

        <!-- Difficulty -->
        <div class="flex overflow-hidden text-sm font-bold uppercase divide-x divide-gray-900 rounded select-none divide-opacity-25">
          <div class="flex items-center justify-center flex-auto p-3 cursor-pointer hover:bg-gray-900" :class="selectedDifficulty === 'easy' ? 'bg-gray-900 lean' : 'bg-gray-700'" @click="selectedDifficulty = 'easy'">
            <i class="hidden mr-3 -my-4 text-5xl opacity-50 fa fa-smile-beam sm:inline-block" :class="selectedDifficulty === 'easy' ? 'text-green-500' : ''" />
            <span>easy</span>
          </div>
          <div class="flex items-center justify-center flex-auto p-3 cursor-pointer hover:bg-gray-900" :class="selectedDifficulty === 'normal' ? 'bg-gray-900' : 'bg-gray-700'" @click="selectedDifficulty = 'normal'">
            <i class="hidden mr-3 -my-4 text-5xl opacity-50 fa fa-grimace sm:inline-block" :class="selectedDifficulty === 'normal' ? 'text-yellow-500 ' : ''" />
            <span>normal</span>
          </div>
          <div class="flex items-center justify-center flex-auto p-3 cursor-pointer hover:bg-gray-900" :class="selectedDifficulty === 'hard' ? 'bg-gray-900 shake' : 'bg-gray-700'" @click="selectedDifficulty = 'hard'">
            <i class="hidden mr-3 -my-4 text-5xl opacity-50 fa fa-dizzy sm:inline-block" :class="selectedDifficulty === 'hard' ? 'text-red-500 ' : ''" />
            <span>hard</span>
          </div>
          <!-- <div v-for="difficultyId of ['easy', 'normal', 'hard']" :key="difficultyId" class="flex items-center justify-center flex-auto p-3 overflow-hidden bg-gray-700 rounded cursor-pointer hover:bg-gray-900" @click="selectedDifficulty = difficultyId">
            <i class="hidden mr-3 -my-1 text-lg fa fa-circle sm:inline-block" :class="selectedDifficulty === difficultyId ? 'text-yellow-500' : 'text-gray-500'" />
            {{ difficultyId }}
          </div> -->
        </div>

        <!-- Contacts -->
        <div class="relative flex-1">
          <UiInput :input="contactsInput" class="w-full px-3 py-2 bg-gray-700 rounded focus:bg-gray-600" placeholder="contacts (discord#id or email)" />
        </div>
      </fieldset>

      <div class="text-sm text-center text-gray-500" v-if="data.since">Submitted at {{ data.since.substring(11, 19) }}, {{ prettyDate(data.since.substring(0, 10)) }}</div>

      <fieldset v-if="!data.id">
        <!--
          <div class="flex justify-between text-gray-300">
            <div class="flex items-center"><i class="mr-1 fa fa-id-card" />name</div>
            <div class="flex items-center"><i class="mr-1 fa fa-clock" />timer</div>
            <div class="flex items-center"><i class="mr-1 fa fa-tachometer-alt" />speed</div>
            <div class="flex items-center"><i class="mr-1 fa fa-keyboard" />keys</div>
          </div>
        -->
        <div class="flex justify-between">
          <div class="flex items-end flex-1">
            <label class="flex items-center font-bold cursor-pointer">
              <input class="w-5 h-5 mr-2 cursor-pointer" type="checkbox" v-model="agreeMapRules" />
              <span>I agree to the</span>
            </label>
            &nbsp;
            <span class="font-bold text-blue-300 border-b border-blue-300 border-dashed cursor-pointer hover:text-blue-400" @click="rulesCollapser.toggle()">rules</span>
          </div>
          <div class="flex justify-between space-x-2 text-gray-700">
            <i class="fa fa-fw fa-check-circle" title="published" />
            <i class="fa fa-fw fa-palette" title="arted" />
            <i class="fa fa-fw fa-archive" title="completed" />
          </div>
        </div>
        <UiCollapser v-if="mapRules.length" :collapser="rulesCollapser" class="-mb-1">
          <ul class="pt-3 pb-1 pl-6 -mb-1 space-y-1 text-sm text-gray-400 whitespace-normal">
            <li class="list-disc" v-for="rule in mapRules" :key="rule">{{ rule }}</li>
          </ul>
        </UiCollapser>
      </fieldset>
    </form>

    <!-- Admin -->
    <div v-if="data.id" class="p-6 pt-0">
      <div class="flex space-x-2">
        <div class="p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-red-800 to-red-900 hover:from-red-700" title="Delete map" @click="deleteWithConfirm()"><i class="fa fa-fw fa-trash" /></div>
        <div v-if="data.until" class="p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700" title="Unarchive map" @click="unarchiveWithConfirm()"><i class="fa fa-fw fa-box-open" /></div>
        <div v-else class="p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700" title="Archive map" @click="archiveWithConfirm()"><i class="fa fa-fw fa-archive" /></div>
        <div v-if="data.approved" class="flex-1 p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700" @click="save()">Save</div>
        <div v-else class="flex-1 p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-green-800 to-green-900 hover:from-green-700" @click="approve()">Approve</div>
      </div>
      <div class="mt-6 font-bold leading-6 text-center text-red-600 whitespace-normal -p-1" v-if="error">Error! {{ error }}</div>
    </div>

    <!-- Submit -->
    <div v-else class="p-6 pt-0">
      <div class="relative p-3 font-bold text-center text-white uppercase rounded cursor-pointer select-none bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700" v-if="!success" @click="submit()">
        {{ error ? 'Submit again' : 'Submit my map' }}
      </div>
      <div class="p-3 text-center" v-if="success">
        <p class="text-xl font-bold">Submitted!</p>
        <p class="mt-2 leading-6 text-gray-400 whitespace-normal">It's gonna be manually checked and approved soon. Thank you for your map!</p>
        <p class="mt-4 cursor-pointer hover:text-yellow-200" @click="reset()">Submit another one</p>
      </div>
      <div class="mt-3 font-bold leading-6 text-center text-red-600 whitespace-normal -p-1" v-if="error">Error! {{ error }}</div>
    </div>

    <div class="absolute top-0 right-0 p-1 m-2 text-2xl text-gray-500 cursor-pointer hover:text-red-600" @click="modalMap.close()">✖</div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, watchEffect, watch } from 'vue'
  import { onKeyStroke } from '@vueuse/core'
  import { modalMap } from '../../store/ui'
  import { mapRules, mapsById, maps, physicsById, tagsById, authors, tags, updateData } from '../../store/data'
  import { getMaps, submitMap, saveMap, deleteMap } from '../../api'
  import { compareStrings, prettyDate, includeString } from '../../utils'
  import { storage, token } from '../../store/storage'

  const data = (modalMap.data || { tagNames: [] }) as TMap
  const success = ref(false)
  const error = ref('')

  const predefinedMap = mapsById.value.get(data.id)?.name || ''
  const predefinedAuthor = data?.authorNames || (storage.value.user.name ? [storage.value.user.name] : [])
  const predefinedTags = data.tagNames.filter((tagName) => !tagsById.value.get(tagName.toLowerCase())?.auto || tagName === 'official')
  const predefinedPhysics = data.tagNames.filter((tagName) => (tagsById.value.get(tagName.toLowerCase())?.group || 0) == 3) as TPhysicsId[]
  const predefinedDifficulty = data.tagNames.includes('hard') ? 'hard' : data.tagNames.includes('normal') ? 'normal' : 'easy'

  const newMaps = ref<TMapsData['maps']>([])

  const selectedAuthors = ref(new Set<TAuthorId>(predefinedAuthor))
  const selectedTags = ref(new Set<TTagId>(predefinedTags))
  const selectedPhysics = ref(new Set<TPhysicsId>(predefinedPhysics.length ? predefinedPhysics : ['race']))
  const selectedDifficulty = ref(predefinedDifficulty)
  const contactsInput = reactive({ value: data?.contacts || storage.value.user.contacts || '' } as TInput)

  const agreeMapRules = ref(storage.value.user.agreeMapRules)
  const rulesCollapser = reactive({ active: !storage.value.user.agreeMapRules } as TCollapser)

  const mapSelect = reactive({ value: predefinedMap } as TSelect)
  const authorSelect = reactive({} as TSelect)
  const tagSelect = reactive({} as TSelect)
  const versionInput = reactive({ value: data?.version || '1' } as TInput)

  // Computed

  const currentMap = computed(() => {
    const name = mapSelect.value.toLowerCase()
    return maps.value.find((map) => map.id.toLowerCase() === name || map.name.toLowerCase() === name) || newMaps.value.find((map) => map.id.toLowerCase() === name || map.name.toLowerCase() === name)
  })

  const newMap = computed(() => {
    return {
      name: currentMap.value?.name,
      id: currentMap.value?.id,
      version: +versionInput.value,
      authorNames: [...selectedAuthors.value],
      tagNames: [...selectedPhysics.value, selectedDifficulty.value, ...selectedTags.value],
      contacts: contactsInput.value,
    } as Partial<TMap>
  })

  // Lists

  const autocompletedMaps = computed(() => {
    const filteredMaps = mapSelect.changed ? newMaps.value.filter((map) => includeString(map.id, mapSelect.value) || includeString(map.name, mapSelect.value)) : newMaps.value
    const sortedMaps = filteredMaps.sort((a, b) => compareStrings(a.name, b.name))
    return sortedMaps
  })

  const autocompletedAuthors = computed(() => {
    const availableAuthors = authors.value.filter((author) => !selectedAuthors.value.has(author.name))
    const filteredAuthors = authorSelect.changed ? availableAuthors.filter((author) => includeString(author.id, authorSelect.value) || includeString(author.name, authorSelect.value)) : availableAuthors
    const sortedAuthors = filteredAuthors.sort((a, b) => compareStrings(a.name, b.name))
    return sortedAuthors
  })

  const autocompletedTags = computed(() => {
    const availableTags = tags.value.filter((tag) => !selectedTags.value.has(tag.name) && ((data.id && !tag.auto) || (!data.id && tag.custom)))
    const filteredTags = tagSelect.changed ? availableTags.filter((tag) => includeString(tag.id, tagSelect.value) || includeString(tag.name, tagSelect.value)) : availableTags
    const sortedTags = filteredTags.sort((a, b) => a.group - b.group || compareStrings(a.name, b.name))
    return sortedTags
  })

  const isNewAuthor = computed(() => authorSelect.value && !authors.value.find((author) => author.name.toLowerCase() === authorSelect.value.trim().toLowerCase()))
  const isNewTag = computed(() => tagSelect.value && !tags.value.find((tag) => tag.name.toLowerCase() === tagSelect.value.trim().toLowerCase()))

  getMaps().then((mapsData) => {
    const authorsById = new Map()
    for (const author of mapsData.authors) {
      authorsById.set(author.id, author.name)
    }
    newMaps.value = mapsData.maps
      .filter((map) => map.modeIds.join() === 'race' && map.reviewed && map.thumbnail && !mapsById.value.has(map.id))
      .map((map) => ({ ...map, author: authorsById.get(map.authorId) || '' }))
      .sort((map1, map2) => compareStrings(map1.name, map2.name))
  })

  // autocomplete map's name and physics
  watchEffect(() => {
    const map = newMaps.value.find((map) => map.name.toLowerCase() === mapSelect.value.toLowerCase())
    if (map) {
      mapSelect.set(map.name)
      // autoselect author??
    }
  })

  watch(agreeMapRules, (newValue) => {
    if (newValue) {
      rulesCollapser.close()
    } else {
      rulesCollapser.open()
    }
  })

  onKeyStroke('Escape', () => {
    modalMap.close()
  })

  function selectMap(mapName: string, authorName?: string) {
    mapSelect.set(mapName)
    if (authorName && (!storage.value.user.name || storage.value.user.name !== [...selectedAuthors.value].join(''))) {
      selectedAuthors.value = new Set([authorName])
    }
  }

  function addAuthor(authorName: string) {
    selectedAuthors.value.add(authorName)
    authorSelect.clear()
  }

  function addTag(tagName: string) {
    selectedTags.value.add(tagName)
    tagSelect.clear()
  }

  function reset() {
    success.value = false
    mapSelect.value = ''
    selectedDifficulty.value = 'easy'
    selectedTags.value.clear()
    selectedAuthors.value = new Set(storage.value.user.author ? [storage.value.user.author] : [])
  }

  function validate() {
    error.value = ''

    if (!currentMap.value?.id) {
      error.value = 'Map is not selected.'
      return
    }

    if (!selectedAuthors.value.size) {
      error.value = "You have to add the map's author."
      return
    }

    if (!selectedPhysics.value.size) {
      error.value = 'You have to select at least one physics.'
      return
    }

    if (!contactsInput.value) {
      error.value = 'Admins need your contacts in case of questions.'
      return
    }

    if (!agreeMapRules.value) {
      error.value = 'You have to agree to the rules.'
      return
    }
  }

  function submit() {
    validate()
    if (error.value) {
      return
    }
    Object.assign(storage.value.user, {
      name: storage.value.user.name || newMap.value.authorNames?.[0],
      contacts: contactsInput.value,
      agreeMapRules: agreeMapRules.value,
    })
    handleRequest(submitMap(newMap.value)).then(() => (success.value = true))
  }

  function save() {
    handleRequest(saveMap(data.id, newMap.value))
  }

  function approve() {
    handleRequest(saveMap(data.id, { approved: true }))
  }

  function archiveWithConfirm() {
    if (window.confirm('The map will be archived. Are you sure?')) {
      handleRequest(saveMap(data.id, { until: new Date().toISOString() }))
    }
  }

  function unarchiveWithConfirm() {
    if (window.confirm('The map will be unarchived. Are you sure?')) {
      handleRequest(saveMap(data.id, { until: '' }))
    }
  }

  function deleteWithConfirm() {
    if (window.confirm('The map will be deleted. Are you sure?')) {
      handleRequest(deleteMap(data.id))
    }
  }

  function handleRequest(request: Promise<{ success?: boolean; error?: string }>) {
    error.value = ''
    return request
      .then((res) => {
        if (res.error) {
          throw Error(res.error)
        }
        if (res.success) {
          updateData()
          modalMap.close()
        }
        return res.success
      })
      .catch((err) => {
        error.value = err.message || err.value
      })
  }
</script>

<style scoped>
  .shake > * {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-0.01em, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(0.05em, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-0.1em, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(0.1em, 0, 0);
    }
  }

  .lean > .fa {
    animation: lean 3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: rotate(0);
  }

  @keyframes lean {
    10%,
    90% {
      transform: rotate(-5deg);
    }

    20%,
    80% {
      transform: rotate(10deg);
    }

    30%,
    50%,
    70% {
      transform: rotate(-5deg);
    }

    40%,
    60% {
      transform: rotate(5deg);
    }
  }
</style>
