<script setup>
import { ref, onMounted, inject } from 'vue'
import RepoList from '@/components/RepoList.vue'
import NavBar from '@/components/NavBar.vue';
import { ViewportKey } from '@/keys/viewport'

const { isMobile } = inject(ViewportKey)

</script>

<template>
  <main>
    <div class="flex flex-col h-screen bg-gray-100">
        <NavBar />
        <div 
        :class="['flex flex-col pb-30 overflow-y-auto h-fill',
        isMobile ? 'px-5' : 'px-20'
        ]">
            <RepoList />
        </div>
    </div>
  </main>
</template>
