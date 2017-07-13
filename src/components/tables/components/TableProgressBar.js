import ProgressLinear from '~components/progress/ProgressLinear'

export default {
  functional: true,

  props: {
    loading: {
      type: [Boolean, String],
      default: false
    }
  },

  render (h, { props }) {
    const color = typeof props.loading === 'boolean' ? 'primary' : props.color
    const loader = h(ProgressLinear, {
      props: {
        primary: color === 'primary',
        secondary: color === 'secondary',
        success: color === 'success',
        info: color === 'info',
        warning: color === 'warning',
        error: color === 'error',
        indeterminate: true,
        height: 3,
        active: !!props.loading
      }
    })

    const col = h('th', {
      class: 'column',
      attrs: {
        colspan: '100%'
      }
    }, [loader])

    return h('thead', { class: 'datatable__progress' }, [h('tr', [col])])
  }
}
