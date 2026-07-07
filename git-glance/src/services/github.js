const BASE_URL = 'https://api.github.com'

const headers = {
  Accept: 'application/vnd.github+json',
  ...(import.meta.env.VITE_GITHUB_TOKEN && {
    Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
  }),
}

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