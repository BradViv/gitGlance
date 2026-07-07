import { createRouter, createWebHistory } from 'vue-router'
import RepoView from '@/views/RepoView.vue'
import HomeView from '@/views/HomeView.vue'
import FavouritesView from '@/views/FavouritesView.vue'
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
    {
      path: '/favourites',
      name: 'favourites',
      component: FavouritesView,
    }
  ],
})

export default router
