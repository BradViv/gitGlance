const BASE_URL = 'https://api.github.com'

export async function getMutlipleRepos(query = "stars:>0", count = 30, page = 1) {
  const response = await fetch(`${BASE_URL}/search/repositories?q=${query}&per_page=${count}&page=${page}`)

  console.log('response', response)
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`)
  }
  const repos = await response.json()

  return repos.items
}

export async function getRepo(owner, name) {
  const response = await fetch(`${BASE_URL}/repos/${owner}/${name}`)

  if (!response.ok) {
    const message =
      response.status === 404
        ? `Repository "${owner}/${name}" not found`
        : `GitHub API error (${response.status})`
    throw new Error(message)
  }

  return response.json()
}
