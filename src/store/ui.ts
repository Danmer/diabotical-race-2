import { reactive, Ref } from 'vue'

// import { session } from './session'

export const modalVideo = createModal({ name: 'iframe' })

export const modalMap = createModal({ name: 'map' })

export const modalEggcup = createModal({ name: 'eggcup' })

export const modalRun = createModal({ name: 'run' })

export const modalPlayer = createModal({ name: 'player' })

export const modalAdmin = createModal({ name: 'admin' })

function createModal(props = {} as Partial<TModal>) {
  const newModal = reactive({
    name: 'modal',
    visible: false,
    active: false,
    closing: false,
    opening: false,
    data: null,
    ...props,
    open() {},
    close() {},
  }) as TModal

  return newModal
}

/*

export const nameSelect = createSelect({ value: session.name || '' } as TSelect)
export const flagSelect = createSelect({ value: session.flag || '', lowercase: true } as TSelect)
export const mapSelect = createSelect({ value: '' } as TSelect)
export const versionSelect = createSelect({ value: '' } as TSelect)
export const timeInput = createInput({ value: '', mask: ['9.999', '99.999', '9:99.999', '99:99.999'] } as TInput)
export const videoInput = createInput({ value: '' } as TInput)

function createInput(options: Partial<TInput>) {
  return reactive({
    backup: '',
    value: '',
    focused: false,
    changed: false,
    clearable: false,
    lowercase: false,
    number: false,
    ...options,
    focus() {
      this.onFocus()
      // el.value?.focus()
    },
    select() {
      this.onSelect()
      // el.value?.select()
    },
    set(newValue: string) {
      if (this.lowercase) {
        newValue = newValue.toLowerCase()
      }
      this.changed = true
      this.value = newValue
      this.onInput()
      // emit
    },
    clear() {
      this.set('')
      this.onClear()
      // emit
    },
    onInput() {},
    onClear() {},
    onFocus() {},
    onSelect() {},
  })
}

function createDropdown() {
  return {
    active: false,
    closing: false,
    opening: false,
    open() {
      //   console.log('open dropdown')
      if (this.active) {
        return false
      }
      emit('open')
      this.closing = false
      this.opening = true
      this.active = true
      clearTimeout(openingTimeout)
      clearTimeout(closingTimeout)
      openingTimeout = setTimeout(() => {
        this.opening = false
        if (this.active) {
          emit('opened')
        }
      }, 300)
    },
    close() {
      // console.log('close this')
      if (!this.active) {
        return false
      }
      emit('close')
      this.opening = false
      this.closing = true
      nextTick(() => (this.active = false))
      clearTimeout(openingTimeout)
      clearTimeout(closingTimeout)
      closingTimeout = setTimeout(() => {
        this.closing = false
        if (!this.active) {
          emit('closed')
        }
      }, 300)
    },
    toggle() {
      // console.log('toggle this')
      if (!this.closing) {
        if (this.active) {
          this.close()
        } else {
          this.open()
        }
      }
    },
  }
}
*/
