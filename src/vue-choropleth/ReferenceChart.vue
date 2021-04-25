<script>
import { LControl } from '@vue-leaflet/vue-leaflet'
import chroma from "chroma-js"
import { validNumber } from "./util"
export default {
  components: {
    LControl
  },
  props: {
    colorScale: null,
    title: String,
    min: null,
    max: null,
    position: {
      type: String,
      default: "topright"
    },
    valueType: {
      type: String,
      default: '비율'
    }
  },
  computed: {
    med () {
      return (this.min + this.max) / 2
    },
    roundedMin () {
      Math.round(this.min * 100) / 100
    },
    roundedMax () {
      Math.round(this.max * 100) / 100
    },
    colors () {
      return chroma
        .scale(this.colorScale)
        .mode("lch")
        .colors(100)
        .reverse()
    }
  },
  mounted () {
    if (this.$parent._isMounted) {
      this.deferredMountedTo(this.$parent.leafletObject)
    }
  },
  methods: {
    deferredMountedTo(parent) {
      this.parent = parent
      this.$refs.legend.leafletObject.addTo(parent.leafletObject)
    }
  },
  beforeUnmount() {
    if (this.parent) {
      this.parent.leafletObject.removeControl(this.$refs.legend.leafletObject)
    }
  }
}
</script>

<template>
  <l-control 
    ref="legend"
    :position="position"
  >
    <h4 class="legend-title">{{ title }}</h4>
    <div class="legend">
      <div class="gradient">
        <span 
          v-for="color in colors"
          class="grad-step" 
          :style="`background-color: ${color}`"
        />
      </div>
      <div class="labels">
        <span class="domain-max">{{ max }}</span>
        <span class="domain-med"></span>
        <span class="domain-min">{{ min }}</span>
      </div>
    </div>
  </l-control>
</template>

<style scoped>
.legend-title {
  color: black;
  font-size: 1rem;
  margin: 0 auto;
}
.legend {
  padding: .5rem;
  margin: .25rem 1rem;
  font: 1rem/1.05rem sans-serif;
  background: rgba(255, 255, 255, 0.8);
  color: black;
  border-radius: .5rem;
  display: flex;
  flex-direction: row;
}
.gradient {
  padding: .5rem 0;
}
.grad-step {
  display: block;
  height: 1px;
  width: 20px;
}
.labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  margin-left: .5rem;
  white-space: nowrap;
  color: black;
}
</style>