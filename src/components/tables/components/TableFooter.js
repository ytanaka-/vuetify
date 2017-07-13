export default {
  name: 'table-footer',

  inheritAttrs: false,

  props: {
    rowsPerPageItems: {
      type: Array,
      default () {
        return [
          5,
          10,
          25,
          { text: 'All', value: -1 }
        ]
      }
    },
    rowsPerPageText: {
      type: String,
      default: 'Rows per page:'
    },
    itemsLength: Number,
    pagination: Object,
    pageStart: Number,
    pageStop: Number
  },

  methods: {
    genIcon ({ icon, click, disabled }) {
      return this.$createElement('v-btn', {
        props: {
          disabled,
          icon: true,
          flat: true
        },
        nativeOn: { click }
      }, [this.$createElement('v-icon', icon)])
    },
    genSelect () {
      return this.$createElement('div', {
        'class': 'datatable__actions__select'
      }, [
        this.rowsPerPageText,
        this.$createElement('v-select', {
          props: {
            items: this.rowsPerPageItems,
            value: this.pagination.rowsPerPage,
            hideDetails: true,
            auto: true
          },
          on: { input: (val) => this.$emit('changeRowsPerPage', val) }
        })
      ])
    },
    genPagination () {
      let pagination = '–'

      if (this.itemsLength) {
        const stop = this.itemsLength < this.pageStop || this.pageStop < 0
                ? this.itemsLength
                : this.pageStop

        pagination = this.$scopedSlots.pageText
          ? this.$scopedSlots.pageText({
            pageStart: this.pageStart + 1,
            pageStop: stop,
            itemsLength: this.itemsLength
          })
          : `${this.pageStart + 1}-${stop} of ${this.itemsLength}`
      }

      return this.$createElement('div', {
        'class': 'datatable__actions__pagination'
      }, [pagination])
    },
    genActions (h) {
      return [h('div', {
        'class': 'datatable__actions'
      }, [
        this.genSelect(),
        this.genPagination(),
        this.genIcon({
          icon: 'chevron_left',
          click: () => this.$emit('changePage', -1),
          disabled: this.pagination.page === 1
        }),
        this.genIcon({
          icon: 'chevron_right',
          click: () => this.$emit('changePage', 1),
          disabled: this.pagination.page * this.pagination.rowsPerPage >= this.itemsLength || this.pageStop < 0
        })
      ])]
    }
  },

  render (h) {
    return h('tfoot', [
      h('tr', [
        h('td', {
          attrs: { colspan: '100%' }
        }, this.genActions(h))
      ])
    ])
  }
}
