import { getObjectValueByPath } from '~util/helpers'
import TableHead from './components/TableHead'
import TableProgressBar from './components/TableProgressBar'
import TableBody from './components/TableBody'
import TableFooter from './components/TableFooter'

export default {
  inheritAttrs: true,

  name: 'datatable',

  provide () {
    return {
      isSelected: this.isSelected
    }
  },

  data () {
    return {
      all: false,
      searchLength: 0,
      defaultPagination: {
        page: 1,
        rowsPerPage: 5,
        descending: false,
        totalItems: 0
      }
    }
  },

  props: {
    headers: {
      type: Array,
      default: () => []
    },
    headerText: {
      type: String,
      default: 'text'
    },
    hideActions: Boolean,
    search: {
      required: false
    },
    filter: {
      type: Function,
      default: (val, search) => {
        return val !== null &&
          ['undefined', 'boolean'].indexOf(typeof val) === -1 &&
          val.toString().toLowerCase().indexOf(search) !== -1
      }
    },
    customFilter: {
      type: Function,
      default: (items, search, filter) => {
        search = search.toString().toLowerCase()
        return items.filter(i => Object.keys(i).some(j => filter(i[j], search)))
      }
    },
    customSort: {
      type: Function,
      default: (items, index, descending) => {
        return items.sort((a, b) => {
          let sortA = getObjectValueByPath(a, index)
          let sortB = getObjectValueByPath(b, index)

          if (descending) {
            [sortA, sortB] = [sortB, sortA]
          }

          if (!isNaN(sortA) && !isNaN(sortB)) return (sortA - sortB)
          else if (sortA == null && sortB == null) return 0;

          [sortA, sortB] = [sortA, sortB].map(s => s.toLocaleLowerCase())
          if (sortA > sortB) return 1
          if (sortA < sortB) return -1

          return 0
        })
      }
    },
    value: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      required: true,
      default: () => []
    },
    totalItems: {
      type: Number,
      default: null
    },
    selectedKey: {
      type: String,
      default: 'id'
    },
    pagination: {
      type: Object,
      default: null
    }
  },

  computed: {
    getPage () {
      return this.computedPagination.rowsPerPage === Object(this.computedPagination.rowsPerPage)
        ? this.computedPagination.rowsPerPage.value
        : this.computedPagination.rowsPerPage
    },
    pageStart () {
      return this.getPage === -1 ? 0 : (this.computedPagination.page - 1) * this.getPage
    },
    pageStop () {
      return this.getPage === -1 ? this.itemsLength : this.computedPagination.page * this.getPage
    },
    computedPagination () {
      return this.pagination || this.defaultPagination
    },
    itemsLength () {
      if (this.search) return this.searchLength
      return this.totalItems || this.items.length
    },
    filteredItems () {
      if (this.totalItems) return this.items

      let items = this.items.slice()
      const hasSearch = typeof this.search !== 'undefined' && this.search !== null

      if (hasSearch) {
        items = this.customFilter(items, this.search, this.filter)
        this.searchLength = items.length
      }

      items = this.customSort(items, this.computedPagination.sortBy, this.computedPagination.descending)

      return this.hideActions && !this.pagination ? items : items.slice(this.pageStart, this.pageStop)
    },
    selected () {
      const selected = {}
      this.value.forEach(i => (selected[i[this.selectedKey]] = true))
      return selected
    }
  },

  watch: {
    search () {
      this.updatePagination({ page: 1 })
    }
  },

  methods: {
    updatePagination (val) {
      if (this.pagination) return this.$emit('update:pagination', Object.assign({}, this.pagination, val))
      else (this.defaultPagination = Object.assign({}, this.defaultPagination, val))
    },
    isSelected (item) {
      return this.selected[item[this.selectedKey]]
    },
    sort (index) {
      if (this.computedPagination.sortBy === null) {
        this.updatePagination({ sortBy: index, descending: false })
      } else if (this.computedPagination.sortBy === index && !this.computedPagination.descending) {
        this.updatePagination({ descending: true })
      } else if (this.computedPagination.sortBy !== index) {
        this.updatePagination({ sortBy: index, descending: false })
      } else {
        this.updatePagination({ sortBy: null, descending: null })
      }
    },
    toggle (value) {
      const selected = Object.assign({}, this.selected)
      this.filteredItems.forEach(i => selected[i[this.selectedKey]] = value)

      this.$emit('input', this.items.filter(i => selected[i[this.selectedKey]]))
    }
  },

  created () {
    const firstSortable = this.headers.find(h => !('sortable' in h) || h.sortable)
    this.defaultPagination.sortBy = firstSortable ? firstSortable.value : null

    this.updatePagination(Object.assign({}, this.defaultPagination, this.pagination))
  },

  render (h) {
    return h('v-table-overflow', {}, [
      h('table', {
        'class': {
          'datatable table': true
        }
      }, [
        h(TableHead, {
          props: {
            ...this.$attrs,
            headers: this.headers,
            filteredItems: this.filteredItems,
            computedPagination: this.computedPagination
          },
          scopedSlots: this.$scopedSlots,
          on: {
            toggle: this.toggle,
            sort: this.sort
          }
        }),
        h(TableProgressBar, {
          props: this.$attrs
        }),
        h(TableBody, {
          props: {
            ...this.$attrs,
            filteredItems: this.filteredItems,
            itemsLength: this.itemsLength
          },
          scopedSlots: this.$scopedSlots,
          on: {
            toggle: ({ item, value }) => {
              let selected = this.value.slice()
              value && selected.push(item) || (selected = selected.filter(i => i[this.selectedKey] !== item[this.selectedKey]))
              this.$emit('input', selected)
            }
          }
        }),
        this.hideActions ? null : h(TableFooter, {
          props: {
            itemsLength: this.itemsLength,
            computedPagination: this.computedPagination,
            pageStart: this.pageStart,
            pageStop: this.pageStop
          },
          on: {
            changeRowsPerPage: (val) => this.updatePagination({ rowsPerPage: val, page: 1 })
          }
        })
      ])
    ])
  }
}
