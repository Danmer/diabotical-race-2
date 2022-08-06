<template>
  <div class="overflow-hidden text-xs rounded">
    <header class="flex items-center bg-gray-800">
      <UiInput :input="searchInput" class="flex-1 px-2 py-1 bg-gray-700 focus:bg-gray-600" :class="{ '!bg-blue-600': filter.tagsSearch }" placeholder="Search" @input="filter.tagsSearch = $event" @vnode-mounted="searchInput.focus()" />
      <!-- <div class="flex items-center flex-1">
        <input class="flex-1 px-2 py-1 bg-opacity-50" :class="{ '!bg-blue-600': filter.tagsSearch }" v-model="filter.tagsSearch" type="text" placeholder="Search" />
        <i v-show="filter.tagsSearch" class="w-4 p-1 -ml-5 opacity-50 cursor-pointer fa fa-times hover:opacity-100" @click="filter.tagsSearch = ''" />
      </div> -->
      <div class="px-2 text-center text-gray-500 capitalize cursor-pointer select-none hover:text-gray-300" @click="tagsSort = tagsSort === 'name' ? 'maps' : tagsSort === 'maps' ? 'players' : tagsSort === 'players' ? 'runs' : 'name'">
        <i class="fa fa-sort-amount-down" />
        {{ tagsSort }}
      </div>
    </header>
    <UiList ref="listComponent" class="overflow-y-scroll text-white bg-gray-700" style="max-height: 50vh" @click="dropdown.close()">
      <AppTag v-for="tag in sortedTags" :key="tag.id" :tag="tag" />
    </UiList>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, inject } from 'vue'
  import { visibleTags } from '../store/data'
  import { filter } from '../store/filter'
  import { compareStrings } from '../utils'
  import AppTag from './Tag.vue'

  const listComponent = ref()
  const tagsSort = ref('name')
  const searchInput = reactive({ value: filter.tagsSearch, clearable: true } as TInput)

  const dropdown = inject('dropdown') as TDropdown

  const sortedTags = computed(() => {
    switch (tagsSort.value.toLowerCase()) {
      case 'name':
        return visibleTags.value.sort((a, b) => a.hidden - b.hidden || a.faded - b.faded || a.group - b.group || compareStrings(a.name, b.name))
      case 'maps':
        return visibleTags.value.sort((a, b) => a.hidden - b.hidden || a.faded - b.faded || a.group - b.group || b.maps.size - a.maps.size)
      case 'players':
        return visibleTags.value.sort((a, b) => a.hidden - b.hidden || a.faded - b.faded || a.group - b.group || b.players.size - a.players.size)
      case 'runs':
        return visibleTags.value.sort((a, b) => a.hidden - b.hidden || a.faded - b.faded || a.group - b.group || b.runs.size - a.runs.size)
      default:
        return visibleTags.value
    }
  })

  watch(
    () => filter.tagsSearch,
    () => listComponent.value?.scrollToTop()
  )
</script>
