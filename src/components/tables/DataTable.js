import { getObjectValueByPath } from '~util/helpers'
import TableHead from './components/TableHead'
import TableProgressBar from './components/TableProgressBar'
import TableBody from './components/TableBody'
import TableFooter from './components/TableFooter'

export default {
  inheritAttrs: false,

  name: 'datatable',

  provide () {
    return {
      isSelected: this.isSelected,
      pageStart: () => this.pageStart,
      pageStop: () => this.pageStop,
      pagination: () => this.computedPagination,
      itemsLength: () => this.itemsLength,
      items: () => this.filteredItems,
      headers: () => this.headers
    }
  },

  data () {
    return {
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
        if (index === null) return items

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
    sortItems (index) {
      let pagination
      if (this.computedPagination.sortBy === null) {
        pagination = { sortBy: index, descending: false }
      } else if (this.computedPagination.sortBy === index && !this.computedPagination.descending) {
        pagination = { descending: true }
      } else if (this.computedPagination.sortBy !== index) {
        pagination = { sortBy: index, descending: false }
      } else {
        pagination = { sortBy: null, descending: null }
      }
      this.updatePagination(pagination)
    },
    toggleAll (value) {
      const selected = Object.assign({}, this.selected)
      this.filteredItems.forEach(i => selected[i[this.selectedKey]] = value)
      this.$emit('input', this.items.filter(i => selected[i[this.selectedKey]]))
    },
    toggleRow ({ item, value }) {
      let selected = this.value.slice()
      value && selected.push(item) || (selected = selected.filter(i => i[this.selectedKey] !== item[this.selectedKey]))
      this.$emit('input', selected)
    },
    changeRowsPerPage (val) {
      this.updatePagination({ rowsPerPage: val, page: 1 })
    },
    changePage (val) {
      this.updatePagination({ page: val })
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
          props: this.$attrs,
          scopedSlots: this.$scopedSlots,
          on: {
            toggleAll: this.toggleAll,
            sortItems: this.sortItems
          }
        }),
        h(TableProgressBar, {
          props: this.$attrs
        }),
        h(TableBody, {
          props: this.$attrs,
          scopedSlots: this.$scopedSlots,
          on: {
            toggleRow: this.toggleRow
          }
        }),
        this.hideActions ? null : h(TableFooter, {
          props: this.$attrs,
          scopedSlots: this.$scopedSlots,
          on: {
            changeRowsPerPage: this.changeRowsPerPage,
            changePage: this.changePage
          }
        })
      ])
    ])
  }
}
