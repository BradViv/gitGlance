const BASE_URL = 'https://api.github.com'

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
