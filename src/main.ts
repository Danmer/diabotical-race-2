import './main.css'
import { createApp } from 'vue'
import * as api from './api'
import App from './components/App.vue'
import UiApproving from './components/ui/Approving'
import UiCollapser from './components/ui/Collapser.vue'
import UiDropdown from './components/ui/Dropdown.vue'
import UiFlag from './components/ui/Flag'
import UiInput from './components/ui/Input.vue'
import UiList from './components/ui/List'
import UiModal from './components/ui/Modal.vue'
import UiPlayer from './components/ui/Player'
import UiSelect from './components/ui/Select.vue'
import UiThumbnail from './components/ui/Thumbnail.vue'
import * as store from './store'
import * as config from './store/config'
import * as data from './store/data'
import * as filter from './store/filter'
import * as storage from './store/storage'
import * as streams from './store/streams'
import * as modals from './store/ui'
import * as utils from './utils'

Object.assign(window, { lb: { ...api, ...store, ...utils, ...data, ...filter, ...config, ...storage, ...streams, ...modals } })

const app = createApp(App)

app.component('UiModal', UiModal)
app.component('UiDropdown', UiDropdown)
app.component('UiCollapser', UiCollapser)
app.component('UiThumbnail', UiThumbnail)
app.component('UiInput', UiInput)
app.component('UiSelect', UiSelect)
app.component('UiPlayer', UiPlayer)
app.component('UiFlag', UiFlag)
app.component('UiList', UiList)
app.component('UiApproving', UiApproving)

app.mount('#app')

window.addEventListener('keyup', ($event) => {
  if ($event.key === 'F2') {
    location.reload()
  }
})
