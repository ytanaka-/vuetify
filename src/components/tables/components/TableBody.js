import Filterable from '~mixins/filterable'

export default {
  name: 'table-body',

  inject: ['isSelected'],

  mixins: [Filterable],

  props: {
    filteredItems: Array,
    noResultsText: {
      type: String,
      default: 'No matching records found'
    },
    itemsLength: Number
  },

  methods: {
    genEmptyBody (text) {
      return this.$createElement('tr', {}, [this.$createElement('td', {
        'class': 'text-xs-center',
        attrs: { colspan: '100%' }
      }, text)])
    }
  },

  render (h) {
    let children = []

    if (!this.itemsLength) {
      children = [this.genEmptyBody(this.noDataText)]
    } else if (!this.filteredItems.length) {
      children = [this.genEmptyBody(this.noResultsText)]
    } else {
      children = this.filteredItems.map((item, index) => {
        const props = { item, index }

        Object.defineProperty(props, 'selected', {
          get: () => this.isSelected(item),
          set: (value) => this.$emit('toggle', { item, value })
        })

        const row = this.$scopedSlots.items(props)

        if (row.length && row[0].tag === 'tr') {
          return row
        } else {
          return h('tr', { attrs: { active: this.isSelected(item) } }, row)
        }
      })
    }

    return h('tbody', children)
  }
}
