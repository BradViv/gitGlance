/**
 * @fileoverview GitHub REST API client for GitGlance.
 *
 * All requests target {@link https://api.github.com} and optionally include a
 * bearer token from `import.meta.env.VITE_GITHUB_TOKEN` to raise rate limits.
 *
 * @see {@link https://docs.github.com/en/rest|GitHub REST API documentation}
 */

const BASE_URL = 'https://api.github.com'

/** Default request headers sent with every GitHub API call. */
const headers = {
  Accept: 'application/vnd.github+json',
  ...(import.meta.env.VITE_GITHUB_TOKEN && {
    Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
  }),
}

/**
 * Search public repositories via the GitHub Search API.
 *
 * Builds a search query from the provided text and optional language filter.
 * Empty or null queries default to `stars:>0`. Language is appended to `q` as
 * `language:{name}` (GitHub does not support a separate language parameter).
 *
 * Results are sorted in descending order. GitHub caps search results at the
 * first 1,000 matches regardless of `total_count`.
 *
 * @see {@link https://docs.github.com/en/rest/search/search#search-repositories}
 *
 * @param {string | null} query - Search text or GitHub search qualifiers (e.g. `vue`, `user:octocat`).
 *   Defaults to `stars:>0` when empty or null.
 * @param {number} [count=20] - Results per page (`per_page`). Maximum is 100.
 * @param {number} [page=1] - Page number (1-based).
 * @param {'stars' | 'forks' | 'help-wanted-issues' | 'updated'} [sort='stars'] - Sort field.
 * @param {string} [language=''] - Optional language filter (e.g. `javascript`, `python`).
 *
 * @returns {Promise<{
 *   total_count: number,
 *   incomplete_results: boolean,
 *   items: Array<GitHubRepository>
 * }>} Search response including `items` (repository objects) and `total_count`.
 *
 * @throws {Error} When the API responds with a non-OK status.
 *
 * @example
 * const result = await getMutlipleRepos('vue', 20, 1, 'stars', 'typescript')
 * console.log(result.items, result.total_count)
 */
export async function getMutlipleRepos(query, count = 20, page = 1, sort = 'stars', language = '') {
  if (query === null || query.trim() === '') {
    query = 'stars:>0'
  }

  if (language?.trim()) {
    query += ` language:${language.trim()}`
  }

  const params = new URLSearchParams({
    q: query,
    per_page: String(count),
    page: String(page),
    sort,
    order: 'desc',
  })

  const response = await fetch(`${BASE_URL}/search/repositories?${params}`, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`)
  }
  const repos = await response.json()

  return repos
}

/**
 * Fetch metadata for a single repository.
 *
 * @see {@link https://docs.github.com/en/rest/repos/repos#get-a-repository}
 *
 * @param {string} owner - Repository owner (user or organisation login).
 * @param {string} name - Repository name (without the owner prefix).
 *
 * @returns {Promise<GitHubRepository>} Full repository object from GitHub.
 *
 * @throws {Error} With message `Repository "{owner}/{name}" not found` on 404,
 *   or a generic GitHub API error for other failure statuses.
 *
 * @example
 * const repo = await getRepo('vuejs', 'core')
 * console.log(repo.stargazers_count, repo.description)
 */
export async function getRepo(owner, name) {
  const response = await fetch(`${BASE_URL}/repos/${owner}/${name}`, { headers })

  if (!response.ok) {
    const message =
      response.status === 404
        ? `Repository "${owner}/${name}" not found`
        : `GitHub API error (${response.status})`
    throw new Error(message)
  }

  return response.json()
}

/**
 * List contributors for a repository with pagination metadata.
 *
 * Contributors are returned in descending order by number of contributions.
 * Use `hasNext` to determine whether another page exists (parsed from the
 * response `Link` header).
 *
 * @see {@link https://docs.github.com/en/rest/repos/repos#list-repository-contributors}
 *
 * @param {string} owner - Repository owner login.
 * @param {string} repo_name - Repository name.
 * @param {number} [page=1] - Page number (1-based).
 * @param {number} [count=5] - Contributors per page (`per_page`). Maximum is 100.
 *
 * @returns {Promise<{
 *   items: Array<GitHubContributor>,
 *   hasNext: boolean
 * }>} `items` — contributor objects with `login`, `avatar_url`, `contributions`, etc.
 *   `hasNext` — `true` when the API `Link` header includes `rel="next"`.
 *
 * @throws {Error} When the repository is not found (404) or the API returns another error.
 *
 * @example
 * const { items, hasNext } = await getRepoContributors('vuejs', 'core', 1, 10)
 */
export async function getRepoContributors(owner, repo_name, page = 1, count = 5) {

  const response = await fetch(`${BASE_URL}/repos/${owner}/${repo_name}/contributors?per_page=${count}&page=${page}`, { headers })
  
  if (!response.ok) {
    const message =
      response.status === 404
        ? `Repository "${owner}/${repo_name}" not found`
        : `GitHub API error (${response.status})`
    throw new Error(message)
  }

  return {
    items: await response.json(),
    hasNext: response.headers.get('Link')?.includes('rel="next"') ?? false,
  }
}

/**
 * List open issues for a repository with pagination metadata.
 *
 * Note: GitHub's issues endpoint also returns pull requests unless excluded
 * via search or additional filtering. Only issues with `state=open` are requested.
 *
 * @see {@link https://docs.github.com/en/rest/issues/issues#list-repository-issues}
 *
 * @param {string} owner - Repository owner login.
 * @param {string} repo_name - Repository name.
 * @param {number} [page=1] - Page number (1-based).
 * @param {number} [count=10] - Issues per page (`per_page`). Maximum is 100.
 *
 * @returns {Promise<{
 *   items: Array<GitHubIssue>,
 *   hasNext: boolean
 * }>} `items` — issue objects with `title`, `user`, `created_at`, `html_url`, etc.
 *   `hasNext` — `true` when the API `Link` header includes `rel="next"`.
 *
 * @throws {Error} When the repository is not found (404) or the API returns another error.
 *
 * @example
 * const { items, hasNext } = await getRepoOpenIssues('vuejs', 'core', 1, 10)
 */
export async function getRepoOpenIssues(owner, repo_name, page = 1, count = 10) {
  const response = await fetch(`${BASE_URL}/repos/${owner}/${repo_name}/issues?state=open&per_page=${count}&page=${page}`, { headers })

  if (!response.ok) {
    const message =
      response.status === 404
        ? `Repository "${owner}/${repo_name}" not found`
        : `GitHub API error (${response.status})`
    throw new Error(message)
  }

  return {
    items: await response.json(),
    hasNext: response.headers.get('Link')?.includes('rel="next"') ?? false,
  }
}

/**
 * @typedef {Object} GitHubRepository
 * @property {number} id - Unique repository ID.
 * @property {string} name - Short repository name.
 * @property {string} full_name - Fully qualified `owner/name`.
 * @property {string | null} description - Repository description.
 * @property {string} html_url - URL to the repository on GitHub.
 * @property {number} stargazers_count - Number of stars.
 * @property {number} forks_count - Number of forks.
 * @property {number} open_issues_count - Number of open issues.
 * @property {string | null} language - Primary language reported by GitHub.
 * @property {string} updated_at - ISO 8601 timestamp of last update.
 * @property {{ login: string, avatar_url: string }} owner - Repository owner.
 */

/**
 * @typedef {Object} GitHubContributor
 * @property {number} id - Unique user ID.
 * @property {string} login - GitHub username.
 * @property {string} avatar_url - URL to the user's avatar image.
 * @property {string} html_url - URL to the user's GitHub profile.
 * @property {number} contributions - Number of contributions to the repository.
 */

/**
 * @typedef {Object} GitHubIssue
 * @property {number} id - Unique issue ID.
 * @property {string} title - Issue title.
 * @property {string} html_url - URL to the issue on GitHub.
 * @property {string} created_at - ISO 8601 timestamp when the issue was created.
 * @property {{ login: string, avatar_url: string }} user - Issue author.
 */
