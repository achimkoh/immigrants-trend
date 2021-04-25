import { createRouter, createWebHistory } from 'vue-router'
import Main from './components/Main.vue'
import PopulationMap from './components/PopulationMap.vue'
// import Plot from './components/Plot.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Main },
    { path: '/map', component: PopulationMap },
    // { path: '/plot', component: Plot },
  ],
})

export default router