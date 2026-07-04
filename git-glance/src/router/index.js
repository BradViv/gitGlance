import { createRouter, createWebHistory } from 'vue-router'
import RepoView from '@/views/RepoView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/repo/:owner/:name',
      name: 'repo',
      component: RepoView,
      props: true,
    },
  ],
})

export default router
