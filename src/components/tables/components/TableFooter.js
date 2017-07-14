export default {
  name: 'table-footer',

  inject: ['pageStart', 'pageStop', 'pagination', 'itemsLength'],

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
    }
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
            value: this.pagination().rowsPerPage,
            hideDetails: true,
            auto: true
          },
          on: { input: (val) => this.$emit('changeRowsPerPage', val) }
        })
      ])
    },
    genPagination () {
      const [pageStart, pageStop, itemsLength] = [this.pageStart(), this.pageStop(), this.itemsLength()]
      let pagination = '–'

      if (itemsLength) {
        const stop = itemsLength < pageStop || pageStop < 0
                ? itemsLength
                : pageStop

        pagination = this.$scopedSlots.pageText
          ? this.$scopedSlots.pageText({
            pageStart: pageStart + 1,
            pageStop: stop,
            itemsLength
          })
          : `${pageStart + 1}-${stop} of ${itemsLength}`
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
          click: () => this.$emit('changePage', this.pagination().page - 1),
          disabled: this.pagination().page === 1
        }),
        this.genIcon({
          icon: 'chevron_right',
          click: () => this.$emit('changePage', this.pagination().page + 1),
          disabled: this.pagination().rowsPerPage < 0 ||
            this.pagination().page * this.pagination().rowsPerPage >= this.itemsLength() ||
            this.pageStop() < 0
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
