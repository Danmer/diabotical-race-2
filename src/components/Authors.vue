<template>
  <div class="overflow-hidden text-xs rounded">
    <header class="flex items-center bg-gray-800">
      <UiInput :input="searchInput" class="flex-1 px-2 py-1 bg-gray-700 focus:bg-gray-600" :class="{ '!bg-blue-600': filter.authorsSearch }" placeholder="Search" @input="filter.authorsSearch = $event" @vnode-mounted="searchInput.focus()" />
      <!-- <div class="flex items-center flex-1">
        <input class="flex-1 px-2 py-1 bg-opacity-50" :class="{ '!bg-blue-600': filter.authorsSearch }" v-model="filter.authorsSearch" type="text" placeholder="Search" />
        <i v-show="filter.authorsSearch" class="w-4 p-1 -ml-5 opacity-50 cursor-pointer fa fa-times hover:opacity-100" @click="filter.authorsSearch = ''" />
      </div> -->
      <div class="px-2 text-center text-gray-500 capitalize cursor-pointer select-none hover:text-gray-300" @click="authorsSort = authorsSort === 'name' ? 'maps' : authorsSort === 'maps' ? 'players' : authorsSort === 'players' ? 'runs' : 'name'">
        <i class="fa fa-sort-amount-down" />
        {{ authorsSort }}
      </div>
    </header>
    <UiList ref="listComponent" class="overflow-y-scroll text-white bg-gray-700" style="max-height: 50vh" @click="dropdown.close()">
      <AppAuthor v-for="author in sortedAuthors" :key="author.name" :author="author" class="top-0 bottom-0 z-10 flex items-start justify-between w-full p-2 cursor-pointer row hover:bg-gray-900" :class="{ 'opacity-25': author.hidden, 'active sticky': author.active }" />
    </UiList>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, inject, reactive, onMounted } from 'vue'
  import { visibleAuthors } from '../store/data'
  import { filter } from '../store/filter'
  import { compareStrings } from '../utils'
  import AppAuthor from './Author.vue'

  const listComponent = ref()
  const authorsSort = ref('name')
  const searchInput = reactive({ value: filter.authorsSearch, clearable: true } as TInput)

  const dropdown = inject('dropdown') as TDropdown

  const sortedAuthors = computed(() => {
    switch (authorsSort.value.toLowerCase()) {
      case 'name':
        return visibleAuthors.value.sort((a, b) => a.hidden - b.hidden || a.faded - b.faded || compareStrings(a.name, b.name))
      case 'maps':
        return visibleAuthors.value.sort((a, b) => a.hidden - b.hidden || a.faded - b.faded || b.maps.size - a.maps.size)
      case 'players':
        return visibleAuthors.value.sort((a, b) => a.hidden - b.hidden || a.faded - b.faded || b.players.size - a.players.size)
      case 'runs':
        return visibleAuthors.value.sort((a, b) => a.hidden - b.hidden || a.faded - b.faded || b.runs.size - a.runs.size)
      default:
        return visibleAuthors.value
    }
  })

  watch(
    () => filter.authorsSearch,
    () => listComponent.value?.scrollToTop()
  )
</script>
