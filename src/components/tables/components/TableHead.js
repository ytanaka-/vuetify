export default {
  name: 'table-head',

  inject: ['isSelected'],

  data () {
    return {
      all: false
    }
  },

  props: {
    headers: {
      type: Array,
      default: () => ([])
    },
    selectAll: [Boolean, String],
    filteredItems: Array,
    headerText: String,
    computedPagination: Object
  },

  computed: {
    hasSelectAll () {
      return this.selectAll !== undefined && this.selectAll !== false
    },
    indeterminate () {
      return this.hasSelectAll && this.someItems && !this.everyItem
    },
    everyItem () {
      return this.filteredItems.length && this.filteredItems.every(i => this.isSelected(i))
    },
    someItems () {
      return this.filteredItems.some(i => this.isSelected(i))
    }
  },

  watch: {
    indeterminate (val) {
      if (val) this.all = true
    },
    someItems (val) {
      if (!val) this.all = false
    },
    everyItem (val) {
      if (val) this.all = true
    }
  },

  methods: {
    genHeader (header) {
      const array = [
        this.$scopedSlots.headerCell
          ? this.$scopedSlots.headerCell({ header })
          : header[this.headerText]
      ]

      return this.$createElement('th', ...this.genHeaderData(header, array))
    },
    genHeaderData (header, children) {
      let beingSorted = false
      const classes = ['column']
      const data = {}

      if ('sortable' in header && header.sortable || !('sortable' in header)) {
        data.on = { click: () => this.$emit('sort', header.value) }
        !('value' in header) && console.warn('Data table headers must have a value property that corresponds to a value in the v-model array')

        classes.push('sortable')
        const icon = this.$createElement('v-icon', 'arrow_upward')
        header.align && header.align === 'left' && children.push(icon) || children.unshift(icon)

        beingSorted = this.computedPagination.sortBy === header.value
        beingSorted && classes.push('active')
        beingSorted && this.computedPagination.descending && classes.push('desc') || classes.push('asc')
      }

      header.align && classes.push(`text-xs-${header.align}`) || classes.push('text-xs-right')

      data.class = classes

      return [data, children]
    }
  },

  render (h) {
    let children = []

    if (this.$scopedSlots.headers) {
      const row = this.$scopedSlots.headers({
        headers: this.headers,
        indeterminate: this.indeterminate,
        all: this.all
      })

      children = row.length && row[0].tag === 'tr' ? row : h('tr', [row])
    } else {
      const row = this.headers.map(o => this.genHeader(o))
      const checkbox = this.$createElement('v-checkbox', {
        props: {
          color: this.selectAll === true && '' || this.selectAll,
          hideDetails: true,
          inputValue: this.all,
          indeterminate: this.indeterminate
        },
        on: { change: val => this.$emit('toggle', val) }
      })

      this.hasSelectAll && row.unshift(this.$createElement('th', [checkbox]))

      children = h('tr', [row])
    }

    return h('thead', [children])
  }
}
