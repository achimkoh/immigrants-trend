<script>
// import * as dfd from 'danfojs/src/index'
// import { defineProps, reactive } from 'vue'

export default {
  props: {
    msg: String
  },
  data () {
    return {
      state: { count: 0 }
    }
  },
  async mounted () {
    // const df = await dfd.read_excel('/시군구별_및_연령별_등록외국인_현황_20210420231559.xls')
    // console.log(df.columns)
    
    // df
    // .iloc({ rows: ['1:'] })
    // .plot( "plot_div" )
    // .bar({ x: '연령별(1)', y: '총계' })
  }
}
</script>

<template>
  <div id="plot_div" />
</template>

<style scoped>

</style>
