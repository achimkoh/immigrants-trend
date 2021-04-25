<script>
import { LMap } from "@vue-leaflet/vue-leaflet"
import "leaflet/dist/leaflet.css"
import Choropleth from '../vue-choropleth/ChoroplethLayer.vue'

import * as d3 from 'd3-fetch'

import geojson from '../assets/SiGunGu_ver20210101_simplified10pct.json'

export default {
  components: {
    LMap,
    'l-choropleth': Choropleth
  },
  data () {
    return {
      value: {
        key: '2019-ratio',
        metric: '명',
        type: '비율'
      },
      valueTypeOptions: ['수', '비율', '증감', '지역대비증감'],
      year: '2019-ratio',
      subsetValue: '합계',
      subsetOptions: ['총인구','합계','한국국적을 가지지 않은 자','외국인근로자','결혼이민자','유학생','외국국적동포','기타외국인','한국국적을 취득한 자','외국인주민자녀(출생)'],
      genderValue: '계',
      genderOptions: ['계', '여', '남'],
      minZoom: 7,
      zoom: 7,
      maxZoom: 11,
      center: [36, 127.75],
      geojson,
      csv: null,
      population: null,
      maxBounds: [
        [30, 120],
        [42, 135]
      ],
      customMax: 1,
      useCustomMax: false,
    }
  },
  computed: {
    strokeOpacity () {
      const zoom = this.zoom
      if (zoom < 10) 
        return 0.25
      else 
        return 0.5
    },
    strokeWidth () {

      return 1
    },
    yearOptions () {
      const valueType = this.value.type
      if (valueType === '비율') {
        return [
          {key: '2019-ratio', displayText: '2019'},
          {key: '2018-ratio', displayText: '2018'},
          {key: '2017-ratio', displayText: '2017'},
          {key: '2016-ratio', displayText: '2016'},
          {key: '2015-ratio', displayText: '2015'},
        ]
      } else if (valueType === '증감') {
        return [
          {key: '2019-growth', displayText: '2019'},
          {key: '2018-growth', displayText: '2018'},
          {key: '2017-growth', displayText: '2017'},
          {key: '2016-growth', displayText: '2016'},
        ]
      } else if (valueType === '지역대비증감') {
        return [
          {key: '2019-growth-relative-to-area', displayText: '2019'},
          {key: '2018-growth-relative-to-area', displayText: '2018'},
          {key: '2017-growth-relative-to-area', displayText: '2017'},
          {key: '2016-growth-relative-to-area', displayText: '2016'},
        ]
      } else {
        return [
          {key: '2019', displayText: '2019'},
          {key: '2018', displayText: '2018'},
          {key: '2017', displayText: '2017'},
          {key: '2016', displayText: '2016'},
          {key: '2015', displayText: '2015'},
        ]
      }
    },
    colorScale () {
      const valueType = this.value.type
      if (valueType === '증감' || valueType === '지역대비증감') {
        return ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6']
      } else {
        return ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494']
      }
    }
  },
  async mounted () {
    const csv = await d3.csv('/%E1%84%8C%E1%85%B5%E1%84%87%E1%85%A1%E1%86%BC%E1%84%8C%E1%85%A1%E1%84%8E%E1%85%B5%E1%84%83%E1%85%A1%E1%86%AB%E1%84%8E%E1%85%A6%E1%84%8B%E1%85%AC%E1%84%80%E1%85%AE%E1%86%A8%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%8C%E1%85%AE%E1%84%86%E1%85%B5%E1%86%AB%E1%84%92%E1%85%A7%E1%86%AB%E1%84%92%E1%85%AA%E1%86%BC-%E1%84%89%E1%85%B5%E1%84%80%E1%85%AE%E1%86%AB%E1%84%80%E1%85%AE.csv', this.parseNumbers)
    // const csv = await d3.csv('https://korea-immigrant-trend.s3.ap-northeast-2.amazonaws.com/%E1%84%8C%E1%85%B5%E1%84%87%E1%85%A1%E1%86%BC%E1%84%8C%E1%85%A1%E1%84%8E%E1%85%B5%E1%84%83%E1%85%A1%E1%86%AB%E1%84%8E%E1%85%A6%E1%84%8B%E1%85%AC%E1%84%80%E1%85%AE%E1%86%A8%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%8C%E1%85%AE%E1%84%86%E1%85%B5%E1%86%AB%E1%84%92%E1%85%A7%E1%86%AB%E1%84%92%E1%85%AA%E1%86%BC-%E1%84%89%E1%85%B5%E1%84%80%E1%85%AE%E1%86%AB%E1%84%80%E1%85%AE.csv', this.parseNumbers)

    this.csv = csv
    // DEPRECATED: 시군구 geojson 데이터에 포함된 지자체만 다시 필터링
    // this.csv = csv.filter(row => this.geojson.features.map(f => f.properties.sgg).includes(row.SGGCD))
    this.loadData()
    // console.log(this.csv)
    // console.log(this.geojson)
    this.$nextTick( () => {
      console.log(this.$refs.map.leafletObject)
      this.$refs.map.leafletObject.on('zoomend', () => {
        this.zoom = this.$refs.map.leafletObject.getZoom()
      })
    })
  },
  methods: {
    getRowData (row, keys=['2015', '2016', '2017', '2018', '2019']) {
      return keys.map(key => row[key])
    },
    parseNumbers (row) {
      const numberKeys = ['2015', '2016', '2017', '2018', '2019']
      const result = {}
      Object.keys(row).forEach(key => {
        if (numberKeys.includes(key)) {
          // 데이터 열은 문자열을 수로 변환한다.
          if (+row[key] || row[key]==='0' || row[key]===0) {
            result[key] = Number(row[key])
          } else if (row[key] === '-' || !row[key].length) {
            // 빈칸은 0
            result[key] = 0
          } else if (row[key] === '*') {
            // 1명 이상 5명 이하일 경우: 3으로 처리
            result[key] = 3
          } else {
            // 그 외의 예외는 콘솔에 기록
            console.log(row[key])
            result[key] = row[key]
          }
        } else {
          result[key] = row[key]
        }
      })
      return result
    },
    // getSggTotalPopulationRow (csv, sggRow) {
    //   const totalPopulationRow = csv.find(entry => entry['SGGCD'] === sggRow['SGGCD'] && entry['거주외국인별'] === '총인구' && entry['성별'] === '계')
    //   return totalPopulationRow
    // },
    // addPopulationRatio (csv) {
    //   // TODO: 별도 worker에서 실행?
    //   const dataKeys = ['2015', '2016', '2017', '2018', '2019']
    //   csv.forEach(row => {
    //     const sggTotalPopulationRow = this.getSggTotalPopulationRow(csv, row)
    //     // 모든 데이터 열에 대해 총인구 대비 비율을 추가한다.
    //     dataKeys.forEach(key => {
    //       row[`${key}-ratio`] = row[key] / sggTotalPopulationRow[key]
    //     })
    //   })
    // },
    loadData () {
      const csvFiltered = this.csv.filter(row => {
        return (
          row['성별'] === this.genderValue && 
          row['거주외국인별'] === this.subsetValue
        )
      })
      this.population = csvFiltered
    },
    changeYear () {
      this.value.key = this.year
    },
    changeValueType () {
      if (this.value.type === '비율') {
        this.year = `${this.year.slice(0,4)}-ratio`
      } else if (this.value.type === '증감') {
        if (this.year.slice(0,4) === '2015') {
          this.year = '2016-growth'
        } else {
          this.year = `${this.year.slice(0,4)}-growth`
        }
      } else if (this.value.type === '지역대비증감') {
        if (this.year.slice(0,4) === '2015') {
          this.year = '2016-growth-relative-to-area'
        } else {
          this.year = `${this.year.slice(0,4)}-growth-relative-to-area`
        }
      } else {
        this.year = this.year.slice(0,4)
      }
      this.changeYear()
    }
  }
}
</script>

<template>
  <div class="container">
    <div class="title">지방자치단체외국인주민현황</div>
    <div class="selector">
      <div class="selector-item">
        <label for="type">수/비율/증감</label>
        <select name="type" v-model="value.type" @change="changeValueType">
          <option v-for="v in valueTypeOptions">{{ v }}</option>
        </select>
      </div>
      <div class="selector-item">
        <label for="year">연도</label>
        <select name="year" v-model="year" @change="changeYear">
          <option v-for="y in yearOptions" :value="y.key">{{ y.displayText }}</option>
        </select>
      </div>
      <div class="selector-item">
        <label for="subset">분류</label>
        <select name="subset" v-model="subsetValue" @change="loadData">
          <option v-for="s in subsetOptions">{{ s }}</option>
        </select>
      </div>
      <div class="selector-item">
        <label for="gender">성별</label>
        <select name="gender" v-model="genderValue" @change="loadData">
          <option v-for="g in genderOptions">{{ g }}</option>
        </select>
      </div>
    </div>
    <div class="selector">
      <div class="selector-item">
        <label for="max">최대값</label>
        <input type="number" step="0.01" name="max" v-model="customMax">
      </div>
      <div class="selector-item">
        <label for="useCustomMax">수동 지정</label>
        <input type="checkbox" name="useCustomMax" v-model="useCustomMax">
      </div>
    </div>
    <l-map 
      ref="map" 
      :zoom="zoom" 
      :center="center"
      :minZoom="minZoom"
      :maxZoom="maxZoom"
      :zoomAnimation="true"
    >
      <l-choropleth
        v-if="population"
        :geojson="geojson"
        geojsonIdKey="sgg"
        :data="population"
        :value="value"
        idKey="SGGCD"
        titleKey="SGGNM"
        :colorScale="colorScale"
        :strokeOpacity="strokeOpacity"
        :strokeWidth="strokeWidth"
        :customMax="customMax"
        :useCustomMax="useCustomMax"
      >
      </l-choropleth>
    </l-map>
  </div>
</template>

<style scoped>
.container {
  background: black;
}
.title {
  color: white;
  margin-top: 1rem;
  font-size: large;
  font-weight: bold;
}
.leaflet-container {
  height: calc(100vh - 10rem) !important;
  background: #ccc;
}
.selector {
  color: white;
  display: flex;
  justify-content: center;
}
.selector-item {
  margin: .25rem .5rem;
  padding: .25rem;
}
.selector-item select, .selector-item input {
  font-size: .9rem;
  margin-left: .25rem;
}
</style>
