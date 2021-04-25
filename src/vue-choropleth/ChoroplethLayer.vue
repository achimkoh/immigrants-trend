<script>
import { LGeoJson } from "@vue-leaflet/vue-leaflet"
import InfoControl from '../vue-choropleth/InfoControl.vue'
import ReferenceChart from '../vue-choropleth/ReferenceChart.vue'
import { getMin, getMax, getCeil, getFloor, normalizeValue, getColor, validNumber } from "./util"

export default {
  components: {
    LGeoJson,
    InfoControl,
    ReferenceChart
  },
  props: {
    geojson: Object,
    data: Array,
    center: Array,
    colorScale: {type: Array, default: ['#000', '#f00']},
    titleKey: String,
    idKey: String,
    value: Object,
    extraValues: Array,
    geojsonIdKey: String,
    mapStyle: Object,
    zoom: Number,
    mapOptions: Object,
    strokeOpacity: {type: Number, default: 1},
    fillOpacity: {type: Number, default: 1},
    strokeColor: {type: String, default: '000'},
    strokeWidth: {type: Number, default: 1},
    currentItemStrokeColor: {type: String, default:'fff'},
    currentItemStrokeWidth: {type: Number, default: 2},
    customMax: Number,
    useCustomMax: Boolean,
  },
  mounted() {
    if (this.$parent._isMounted) {
      this.deferredMountedTo(this.$parent.mapObject)
    }
  },
  data() {
    return {
      currentItem: { name: "", value: 0 },
      geojsonOptions: {
        smoothFactor: 0.01,
        style: feature => {
          let itemGeoJSONID = feature.properties[this.geojsonIdKey]
          let color = "NONE"
          const {data} = this.geojsonData
          let item = data.find(x => x[this.idKey] == itemGeoJSONID)
          if (!item) {
            return {
              color: "white",
              weight: this.strokeWidth
            }
          }
          let valueParam = Number(item[this.value.key])
          if (!validNumber(valueParam)) {
            return {
              color: "white",
              weight: this.strokeWidth
            }
          }
          return {
            weight: this.strokeWidth,
            opacity: this.strokeOpacity,
            color: `#${this.strokeColor}`,
            fillOpacity: this.fillOpacity,
            fillColor: getColor(valueParam, this.colorScale, this.min, this.max)
          }
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: this.onMouseover.bind(this),
            mouseout: this.onMouseout.bind(this)
          })
        }
      }
    }
  },
  computed: {
    min() {
      // return getMin(this.geojsonData.data, this.value.key)
      const valueType = this.value.type
      const min = getMin(this.geojsonData.data, this.value.key)
      if (valueType === '수') {
        return 0
      } else if (valueType === '비율') {
        return 0
      } else if (valueType === '증감') {
        return -0.35
        // return Math.floor(min * 100) / 100
      } else if (valueType === '지역대비증감') {
        return -0.35
      }
    },
    max() {
      // return getMax(this.geojsonData.data, this.value.key)
      if (this.useCustomMax) {
        return this.customMax
      }
      const valueType = this.value.type
      const max = getMax(this.geojsonData.data, this.value.key)
      if (valueType === '수') {
        return getCeil(max)
      } else if (valueType === '비율') {
        return Math.ceil(max * 100) / 100
      } else if (valueType === '증감' || valueType === '지역대비증감') {
        return 0.35
      }
    },
    geojsonData() {
      return {geojson: {...this.geojson}, data: this.data};
    },
    referenceTitle () {
      if (this.value.type === '수') {
        return '단위: 명'
      } else if (this.value.type === '비율') {
        return '총인구 대비 비중'
      } else if (this.value.type === '증감') {
        return '전년 대비 증감률'
      } else if (this.value.type === '지역대비증감') {
        return '총인구 대비 전년증감률'
      }
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        // key 값이 바뀌었을 때 geojson 색칠 다시 한다.
        // 간혹 데이터 로딩 딜레이 때문인지 제대로 색칠 안 되는 경우 있어서 timeout 지정
        const geolayer = this.$refs.geolayer.leafletObject
        setTimeout(() => {geolayer.resetStyle()}, 50)
      }
    },
    strokeOpacity: {
      handler () {
        this.$refs.geolayer.leafletObject.resetStyle()
      }
    },
    useCustomMax: {
      handler () {
        this.$refs.geolayer.leafletObject.resetStyle()
      }
    },
    customMax: {
      handler () {
        if (this.useCustomMax === true) {
          this.$refs.geolayer.leafletObject.resetStyle()          
        }
      }
    }  },
  methods: {
    deferredMountedTo(parent) {
      this.parent = parent
      for (var i = 0; i < this.$children.length; i++) {
        if (typeof this.$children[i].deferredMountedTo === "function") {
          this.$children[i].deferredMountedTo(parent)
        }
      }
    },
    onMouseover({ target }) {
      // 하이라이트된 영역 스타일 변경
      target.setStyle({
        weight: this.currentItemStrokeWidth,
        color: `#${this.currentItemStrokeColor}`,
        opacity: 1
      })
      target.bringToFront()

      // 하이라이트된 영역에 해당하는 데이터 반환
      const geojsonItem = target.feature.properties
      const item = this.geojsonData.data.find(
        x => x[this.idKey] == geojsonItem[this.geojsonIdKey]
      )
      if (item === undefined) {
        this.currentItem = { name: "", value: 0 }
        return
      }
      let tempItem = { name: item[this.titleKey], value: item[this.value.key] }
      if (this.extraValues) {
        const tempValues = []
        for (const x of this.extraValues) {
          tempValues.push({
            value: item[x.key],
            metric: x.metric
          })
        }
        tempItem = { ...tempItem, extraValues: tempValues }
      }
      this.currentItem = tempItem
    },
    onMouseout({ target }) {
      // 스타일 리셋
      this.$refs.geolayer.leafletObject.resetStyle(target)
      // 데이터 리셋
      this.currentItem = { name: "", value: 0 }
    }
  }
}
</script>

<template>
  <div>
    <l-geo-json 
      :geojson="geojsonData.geojson" 
      :options="geojsonOptions" 
      ref="geolayer"
    />
    <reference-chart
      :title="referenceTitle"
      :colorScale="colorScale"
      :min="min"
      :max="max"
    />
    <info-control 
      title="시군구" 
      placeholder=""
      :currentItem="currentItem" 
      :unit="value.metric" 
      :valueType="value.type"
    />
  </div>
</template>
