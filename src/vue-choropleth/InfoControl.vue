<script>
import { LControl } from '@vue-leaflet/vue-leaflet'
export default {
  components: {
    LControl
  },
  props: {
    currentItem: Object,
    unit: String,
    placeholder: {
      type: String,
      default: ""
    },
    title: String,
    position: {
      type: String,
      default: "bottomleft"
    },
    valueType: {
      type: String,
      default: '비율'
    }
  },
  mounted() {
    if (this.$parent._isMounted) {
      this.deferredMountedTo(this.$parent.leafletObject)
    }
  },
  computed: {
    formatCurrentItemValue () {
      if (!this.currentItem.name) {
        return ''
      } else {
        const value = this.currentItem.value
        if (this.valueType === '수') {
          return value.toLocaleString() + '명'
        } else if (this.valueType === '비율') {
          return (value * 100).toFixed(1) + '명/100명'
        } else if (this.valueType === '증감' || this.valueType === '지역대비증감') {
          return (value * 100).toFixed(1) + '%'
        }
      }
    }
  },
  methods: {
    onAdd () {
      const container = document.createElement("div")
      container.className = "info" // create a div with a class "info"
      this.$refs.control.leafletObject._container = container
      this.updateControl({ name: "", value: 0, unit, placeholder, title })
    },
    updateControl ({
      name,
      value,
      extraValues = undefined,
      unit,
      title,
      placeholder
    }) {
      if (name.length > 0) {
        this.$refs.control.leafletObject._container.innerHTML = `<h4> ${title} </h4>
                    <b> ${name} </b><br /> ${value} ${unit}`
        if (extraValues) {
          for (let x of extraValues) {
            this.$refs.control.leafletObject._container.innerHTML =
              this.$refs.control.leafletObject._container.innerHTML + `<br /> ${x.value} ${x.metric}`
          }
        }
      } else {
        this.$refs.control.leafletObject._container.innerHTML = `<h4> ${title} </h4> <b> ${placeholder} </b>`
      }
    },
    deferredMountedTo(parent) {
      this.parent = parent
      this.$refs.control.leafletObject.addTo(parent.leafletObject)
    }
  },
  watch: {

  },
  beforeUnmount () {
    if (this.parent) {
      this.parent.leafletObject.removeControl(this.$refs.control.leafletObject)
    }
  }
}
</script>

<template>
  <l-control 
    ref="control"
    :position="position"
  >
    <div class="info">
      <h4>{{title}}</h4>
      <p v-if="currentItem.name">{{ currentItem.name }}: {{ formatCurrentItemValue }}</p>
    </div>
  </l-control>
</template>

<style scoped>
.info {
  padding: .5rem;
  margin: 1rem;
  font: 1.2rem/1.25rem sans-serif;
  background: rgba(255, 255, 255, 0.8);
  border-radius: .5rem;
}
.info h4 {
  margin: .5rem;
  color: #777;
}
.info p {
  margin: .5rem;
}
</style>