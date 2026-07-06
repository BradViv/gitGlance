<script setup>
import { ref, watch, inject } from 'vue'
import { getRepo, getRepoContributors, getRepoOpenIssues} from '@/services/github.js'
import NavBar from '@/components/NavBar.vue'
import { ViewportKey } from '@/keys/viewport'

const props = defineProps({
  owner: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})

const repo = ref(null)
const topContributors = ref([])
const contributorsHasNextPage = ref(false)
const repo_loading = ref(false)
const contributors_loading = ref(false)

const openIssues = ref([])
const openIssuesLoading = ref(true)
const openIssuesError = ref(null)
const openIssuesPage = ref(1)
const openIssuesHasNextPage = ref(false)

const error = ref(null)
const page = ref(1)
const contributorsPerPage = 5
const openIssuesPerPage = 10

const { width } = inject(ViewportKey)


async function loadRepo() {
  repo_loading.value = true
  error.value = null
  repo.value = null

  try {
    repo.value = await getRepo(props.owner, props.name)
    
  } catch (e) {
    error.value = e.message
  } finally {
    repo_loading.value = false
  }
}

async function loadContributors() {
  contributors_loading.value = true
  error.value = null
  try {
    const result = await getRepoContributors(props.owner, props.name, page.value)
    topContributors.value = result.items
    contributorsHasNextPage.value = result.hasNext
  } catch (e) {
    error.value = e.message
  } finally {
    contributors_loading.value = false
  }
}

async function loadOpenIssues() {
  openIssuesLoading.value = true
  openIssuesError.value = null
  try {
    const result = await getRepoOpenIssues(props.owner, props.name, openIssuesPage.value)
    openIssues.value = result.items
    console.log('Open Issues:', openIssues.value) // Debugging line
    openIssuesHasNextPage.value = result.hasNext
  } catch (e) {
    openIssuesError.value = e.message
  } finally {
    openIssuesLoading.value = false
  }
}

watch(() => [props.owner, props.name], loadRepo, { immediate: true })
watch(() => [props.owner, props.name, page.value], loadContributors, { immediate: true })
watch(() => [props.owner, props.name, openIssuesPage.value], loadOpenIssues, { immediate: true })
</script>

<template>
  <main class="flex flex-col h-screen bg-gray-100">
    <NavBar />

    <p v-if="repo_loading" class="text-gray-500"> Loading...</p>

    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <!-- Repo information -->
    <article v-else-if="repo && width < 1300" class="flex flex-1 flex-col items-center min-h-0 overflow-y-auto px-20 w-full">
      <!-- Repo header -->
      <header class="flex flex-row justify-center items-center space-x-6 h-1/5 py-5 border-b-2 border-gray-300 w-3/4">
        <img src="../assets/github-icon.png" alt="GitHub Icon" class="size-20 mb-4" />
        
        <div class="flex flex-col justify-between h-full">
          <h1 class="text-2xl font-bold text-gray-900">{{ repo.full_name }} </h1>
          <p v-if="repo.description" class="mt-2 text-primary">By: {{ repo.owner.login }}</p>
          <a
            :href="repo.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block text-primary font-bold hover:underline "
          >
            View on GitHub →
          </a>
        </div>
      </header>

      <!-- Repo details -->
      <div class="flex flex-col justify-center w-full gap-10 my-15">

        <!-- Repo description-->
        <div class="flex flex-col">
            <h2 class="text-xl font-semibold text-primary mb-2">Description</h2>
            <p class="text-gray-700">{{ repo.description }}</p>
        </div>

        <!-- Repo Stats-->
        <div class="flex flex-col">
          <h2 class="text-xl font-semibold text-primary mb-2">Repo Stats</h2>

        <div class="grid grid-flow-col grid-rows-2 gap-2">
          <div class="flex flex-row justify-between mb-2 border-1 border-primary rounded p-2 bg-white shadow">
            <dt class="inline font-medium">Stars:</dt>
            <dd class="inline ml-1">{{ repo.stargazers_count }}</dd>
          </div>
          <div class="flex flex-row justify-between mb-2 border-1 border-primary rounded p-2 bg-white shadow">
            <dt class="inline font-medium">Forks:</dt>
            <dd class="inline ml-1">{{ repo.forks_count }}</dd>
          </div>
          <div class="flex flex-row justify-between mb-2 border-1 border-primary rounded p-2 bg-white shadow">
            <dt class="inline font-medium"># of Open issues:</dt>
            <dd class="inline ml-1">{{ repo.open_issues_count }}</dd>
          </div>
          <div v-if="repo.language" class="flex flex-row justify-between mb-2 border-1 border-primary rounded p-2 bg-white shadow">
            <dt class="inline font-medium">Primary Language:</dt>
            <dd class="inline ml-1">{{ repo.language }}</dd>
          </div>
        </div>

        </div>
        
        <!-- Top Contributors Table -->
        <div class="flex flex-col">
          <h2 class="text-xl font-semibold text-primary mb-2">Top Contributors</h2>
          <div class="overflow-x-auto rounded border border-gray-300 bg-white shadow min-h-80">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-gray-300 bg-gray-50">
                <tr>
                  <th class="px-4 py-3 font-medium text-gray-700">Contributor</th>
                  <th class="px-4 py-3 font-medium text-gray-700 text-right">Contributions</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="contributors_loading">
                  <tr
                    v-for="n in contributorsPerPage"
                    :key="`skeleton-${n}`"
                    class="border-b border-gray-200 last:border-b-0"
                  >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                        <div class="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="ml-auto h-4 w-10 rounded bg-gray-200 animate-pulse" />
                    </td>
                  </tr>
                </template>
                <tr v-else-if="topContributors.length === 0">
                  <td colspan="2" class="px-4 py-3 text-gray-500">No contributors found.</td>
                </tr>
                <template v-else>
                  <tr
                    v-for="contributor in topContributors"
                    :key="contributor.id"
                    class="border-b border-gray-200 last:border-b-0"
                  >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <img
                        :src="contributor.avatar_url"
                        :alt="contributor.login"
                        class="h-8 w-8 rounded-full"
                      />
                      <a
                        :href="contributor.html_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary hover:underline"
                      >
                        {{ contributor.login }}
                      </a>
                      <span
                        v-if="contributor.login === repo.owner.login"
                        class="material-symbols-outlined text-primary text-base"
                        title="Repository owner"
                      >
                        crown
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right text-gray-700">
                    {{ contributor.contributions }}
                  </td>
                </tr>
                </template>
              </tbody>
            </table>
          </div>
          <!-- Pagination controls -->
          <div class="flex justify-center mt-4">
            <button 
              :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                page === 1 ? 'opacity-50 cursor-not-allowed' : '']"
              :disabled="page === 1"
              @click="page--"
            >
              Previous
            </button>
            <button 
              :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                !contributorsHasNextPage ? 'opacity-50 cursor-not-allowed' : '']"
              :disabled="!contributorsHasNextPage"
              @click="page++"
            >
              Next
            </button>
          </div>
        </div>
        
        <!-- Repo issues -->
        <div class="flex flex-col">
          <h2 class="text-xl font-semibold text-primary mb-2">Open Issues</h2>
          <p v-if="openIssuesError" class="mb-2 text-red-600">{{ openIssuesError }}</p>

          <div class="overflow-x-auto rounded border border-gray-300 bg-white shadow min-h-80">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-gray-300 bg-gray-50">
                <tr>
                  <th class="px-4 py-3 font-medium text-gray-700">Issue Title</th>
                  <th class="px-4 py-3 font-medium text-gray-700">Created At</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="openIssuesLoading && openIssues.length === 0">
                  <tr
                    v-for="n in openIssuesPerPage"
                    :key="`skeleton-issue-${n}`"
                    class="border-b border-gray-200 last:border-b-0"
                  >
                    <td class="px-4 py-3">
                      <div class="h-4 w-full max-w-xs rounded bg-gray-200 animate-pulse" />
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="h-8 w-8 shrink-0 rounded-full bg-gray-200 animate-pulse" />
                        <div class="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                    </td>
                  </tr>
                </template>
                <tr v-else-if="!openIssuesLoading && openIssues.length === 0">
                  <td colspan="3" class="px-4 py-3 text-gray-500">No open issues found.</td>
                </tr>
                <template v-else>
                  <tr
                    v-for="issue in openIssues"
                    :key="issue.id"
                    :class="[
                      'border-b border-gray-200 last:border-b-0',
                      openIssuesLoading ? 'opacity-50' : '',
                    ]"
                  >
                    <td class="flex flex-col gap-3 px-4 py-3">
                      <a
                        :href="issue.html_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary hover:underline truncate block max-w-xs"
                      >
                        {{ issue.title }}
                      </a>
                      <div class="flex items-center gap-3">
                        <img
                          :src="issue.user.avatar_url"
                          :alt="issue.user.login"
                          class="size-5 shrink-0 rounded-full"
                        />
                        <span>{{ issue.user.login }}</span>
                      </div>
                    </td>

                    <td class="px-4 py-3">{{ new Date(issue.created_at).toLocaleDateString() }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Pagination controls for open issues -->
          <div class="flex justify-center mt-4">
            <button 
              :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                openIssuesPage === 1 ? 'opacity-50 cursor-not-allowed' : '']"
              :disabled="openIssuesPage === 1"
              @click="openIssuesPage--"
            >
              Previous
            </button>
            <button 
              :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                !openIssuesHasNextPage ? 'opacity-50 cursor-not-allowed' : '']"
              :disabled="!openIssuesHasNextPage"
              @click="openIssuesPage++"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      
    </article>
    <article v-else-if="repo && width >= 1300" class="flex flex-1 flex-col items-center min-h-0 overflow-y-auto px-20 w-full">
      <!-- Repo header -->
      <header class="flex flex-row justify-center items-center space-x-6 h-1/5 py-5 border-b-2 border-gray-300 w-3/4">
        <img src="../assets/github-icon.png" alt="GitHub Icon" class="size-20 mb-4" />
        
        <div class="flex flex-col justify-between h-full">
          <h1 class="text-2xl font-bold text-gray-900">{{ repo.full_name }} </h1>
          <p v-if="repo.description" class="mt-2 text-primary">By: {{ repo.owner.login }}</p>
          <a
            :href="repo.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block text-primary font-bold hover:underline "
          >
            View on GitHub →
          </a>
        </div>
      </header>

      <!-- Repo details -->
      <div class="flex flex-row justify-center w-3/4 py-10 gap-5">

        <!-- Repo stats (Left Panel) -->
        <div class="flex flex-col w-1/3 mx-7 gap-5">
          
          <h2 class="text-xl font-semibold text-primary mb-2">Repo Stats</h2>

          <div class="grid grid-flow-col grid-rows-2 gap-2">
            <div class="flex flex-row justify-between mb-2 border-1 border-primary rounded p-2 bg-white shadow">
              <dt class="inline font-medium">Stars:</dt>
              <dd class="inline ml-1">{{ repo.stargazers_count }}</dd>
            </div>
            <div class="flex flex-row justify-between mb-2 border-1 border-primary rounded p-2 bg-white shadow">
              <dt class="inline font-medium">Forks:</dt>
              <dd class="inline ml-1">{{ repo.forks_count }}</dd>
            </div>
            <div class="flex flex-row justify-between mb-2 border-1 border-primary rounded p-2 bg-white shadow">
              <dt class="inline font-medium"># of Open issues:</dt>
              <dd class="inline ml-1">{{ repo.open_issues_count }}</dd>
            </div>
            <div v-if="repo.language" class="flex flex-row justify-between mb-2 border-1 border-primary rounded p-2 bg-white shadow">
              <dt class="inline font-medium">Primary Language:</dt>
              <dd class="inline ml-1">{{ repo.language }}</dd>
            </div>
          </div>
          <!-- Top Contributors Table -->
          <div class="flex flex-col">
            <h2 class="text-xl font-semibold text-primary mb-2">Top Contributors</h2>
            <div class="overflow-x-auto rounded border border-gray-300 bg-white shadow min-h-80">
              <table class="w-full text-left text-sm">
                <thead class="border-b border-gray-300 bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 font-medium text-gray-700">Contributor</th>
                    <th class="px-4 py-3 font-medium text-gray-700 text-right">Contributions</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="contributors_loading">
                    <tr
                      v-for="n in contributorsPerPage"
                      :key="`skeleton-${n}`"
                      class="border-b border-gray-200 last:border-b-0"
                    >
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <div class="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                          <div class="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                        </div>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <div class="ml-auto h-4 w-10 rounded bg-gray-200 animate-pulse" />
                      </td>
                    </tr>
                  </template>
                  <tr v-else-if="topContributors.length === 0">
                    <td colspan="2" class="px-4 py-3 text-gray-500">No contributors found.</td>
                  </tr>
                  <template v-else>
                    <tr
                      v-for="contributor in topContributors"
                      :key="contributor.id"
                      class="border-b border-gray-200 last:border-b-0"
                    >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <img
                          :src="contributor.avatar_url"
                          :alt="contributor.login"
                          class="h-8 w-8 rounded-full"
                        />
                        <a
                          :href="contributor.html_url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-primary hover:underline"
                        >
                          {{ contributor.login }}
                        </a>
                        <span
                          v-if="contributor.login === repo.owner.login"
                          class="material-symbols-outlined text-primary text-base"
                          title="Repository owner"
                        >
                          crown
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right text-gray-700">
                      {{ contributor.contributions }}
                    </td>
                  </tr>
                  </template>
                </tbody>
              </table>
            </div>
            <!-- Pagination controls -->
            <div class="flex justify-center mt-4">
              <button 
                :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                  page === 1 ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="page === 1"
                @click="page--"
              >
                Previous
              </button>
              <button 
                :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                  !contributorsHasNextPage ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="!contributorsHasNextPage"
                @click="page++"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- Repo issues (Right Panel) -->
        <div class="flex flex-col w-2/3 gap-5">

          <div class="flex flex-col">
            <h2 class="text-xl font-semibold text-primary mb-2">Description</h2>
            <p class="text-gray-700">{{ repo.description }}</p>
          </div>

          <div class="flex flex-col">
            <h2 class="text-xl font-semibold text-primary mb-2">Open Issues</h2>
            <p v-if="openIssuesError" class="mb-2 text-red-600">{{ openIssuesError }}</p>

            <div class="overflow-x-auto rounded border border-gray-300 bg-white shadow min-h-80">
              <table class="w-full text-left text-sm">
                <thead class="border-b border-gray-300 bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 font-medium text-gray-700">Issue Title</th>
                    <th class="px-4 py-3 font-medium text-gray-700">Actor</th>
                    <th class="px-4 py-3 font-medium text-gray-700">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="openIssuesLoading && openIssues.length === 0">
                    <tr
                      v-for="n in openIssuesPerPage"
                      :key="`skeleton-issue-${n}`"
                      class="border-b border-gray-200 last:border-b-0"
                    >
                      <td class="px-4 py-3">
                        <div class="h-4 w-full max-w-xs rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <div class="h-8 w-8 shrink-0 rounded-full bg-gray-200 animate-pulse" />
                          <div class="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="h-4 w-24 rounded bg-gray-200 animate-pulse" />
                      </td>
                    </tr>
                  </template>
                  <tr v-else-if="!openIssuesLoading && openIssues.length === 0">
                    <td colspan="3" class="px-4 py-3 text-gray-500">No open issues found.</td>
                  </tr>
                  <template v-else>
                    <tr
                      v-for="issue in openIssues"
                      :key="issue.id"
                      :class="[
                        'border-b border-gray-200 last:border-b-0',
                        openIssuesLoading ? 'opacity-50' : '',
                      ]"
                    >
                      <td class="px-4 py-3">
                        <a
                          :href="issue.html_url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-primary hover:underline truncate block max-w-xs"
                        >
                          {{ issue.title }}
                        </a>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <img
                            :src="issue.user.avatar_url"
                            :alt="issue.user.login"
                            class="h-8 w-8 shrink-0 rounded-full"
                          />
                          <span>{{ issue.user.login }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3">{{ new Date(issue.created_at).toLocaleDateString() }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <!-- Pagination controls for open issues -->
            <div class="flex justify-center mt-4">
              <button 
                :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                  openIssuesPage === 1 ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="openIssuesPage === 1"
                @click="openIssuesPage--"
              >
                Previous
              </button>
              <button 
                :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                  !openIssuesHasNextPage ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="!openIssuesHasNextPage"
                @click="openIssuesPage++"
              >
                Next
              </button>
            </div>
          </div>


        </div>
      </div>

      
    </article>
  </main>
</template>
