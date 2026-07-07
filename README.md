# GitGlance

By: Braden Vivas

A Vue 3 web app for browsing GitHub repositories. Search public repos, view details (stats, contributors, open issues), and save favourites locally using the [GitHub REST API](https://docs.github.com/en/rest).

## Features

- **Home** — search repositories with pagination, sort (stars / last updated), and language filter
- **Repo details** — `/repo/:owner/:name` with stats, contributors table, and open issues table
- **Favourites** — bookmark repos to `localStorage` and browse them on a dedicated page
- **Responsive UI** — Tailwind CSS with a shared viewport context for mobile vs desktop layouts

---

## Setup and run instructions

### Prerequisites

- [Node.js](https://nodejs.org/) `^22.18.0` or `>=24.12.0` (see `package.json` `engines`)
- npm (included with Node)

### Install

```sh
cd git-glance
npm install
```

### Environment variables (optional but recommended)

Unauthenticated requests are limited to **60 REST requests/hour** and **10 search requests/minute** per IP. For development, add a GitHub personal access token:

1. Create a token at [github.com/settings/tokens](https://github.com/settings/tokens) (no scopes required for public data).
2. Copy `.env.example` to `.env`:

```sh
cp .env.example .env
```

3. Set your token:

```env
VITE_GITHUB_TOKEN=ghp_your_token_here
```

### Development

```sh
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Production build

```sh
npm run build
npm run preview
```

`preview` serves the built app from `dist/` locally.

---

## Key design and architectural decisions

### Vue 3 + Vite + Vue Router

The app uses the Composition API with client-side routing. Repo pages use the `/repo/:owner/:name` pattern with `props: true`, so route params are passed directly into `RepoView` as component props.

### Layered folder structure

| Folder | Responsibility |
|---|---|
| `src/views/` | Route-level pages (`HomeView`, `RepoView`, `FavouritesView`) |
| `src/components/` | Reusable UI (`RepoCard`, `RepoList`, `FilterDrawer`, `NavBar`) |
| `src/services/github.js` | All GitHub API calls and request headers |
| `src/composables/` | Shared reactive logic (`useViewport`) |
| `src/keys/` | Injection keys for `provide` / `inject` |

API logic stays out of components so views stay focused on state and presentation.

### Detailed Repository Choice

When selecting a repository, the user is navigate to the repository details page. Given the choice between either displaying the top contributors or the open issues, I chose both because I believe both would be useful for this app. Each task only required one endpoint each and both were similar in functionality and implementation. Users can choose to view both paginated tables and view more details on GitHub.



### GitHub API service layer

`src/services/github.js` centralises fetch calls, auth headers, and query construction. Search uses `GET /search/repositories` with qualifiers in the `q` parameter (e.g. `stars:>0 language:python`).

Optional auth is applied via `VITE_GITHUB_TOKEN` and the `Authorization: Bearer` header.

### Viewport context (`provide` / `inject`)

`App.vue` provides viewport state from `useViewport()`. Child components read `isMobile` / `width` to switch layouts — e.g. single-column repo grid on mobile, smaller pagination controls, and adaptive `RepoCard` footers — without prop drilling.

### Favourites in `localStorage`

Favourites store only `{ owner, name }` in `localStorage`. Full repo details are fetched from the API when the favourites page loads. This keeps storage small and data fresh, at the cost of extra API calls. Keeping storage small allows the app to wait on asynchronous data instead of local data to maintain uptime.

### Pagination strategies

- **Search (home)** — server-side via GitHub's `page` and `per_page` params; capped at 1,000 results (GitHub search limit).
- **Favourites** — client-side slicing of the stored list, then per-repo `getRepo` calls for the current page.
- **Contributors / issues** — server-side pages; next-page availability is derived from the response `Link` header.

### Styling

[Tailwind CSS v4](https://tailwindcss.com/) is configured via the Vite plugin. Theme tokens (e.g. `--color-primary`) live in `src/assets/main.css`. [Material Symbols](https://fonts.google.com/icons) are loaded from Google Fonts in `index.html`.

---

## Known limitations

- **API rate limits** — Without a token, frequent searching or browsing repo details can trigger `403` rate-limit errors. Use `VITE_GITHUB_TOKEN` during development.
- **Search result cap** — GitHub only returns the first **1,000** results for any search query, regardless of `total_count`.
- **No persistent backend** — Favourites exist only in the browser's `localStorage`; clearing site data or switching browsers loses them.
- **Favourites require multiple API calls** — Each favourite on the favourites page triggers a separate `getRepo` request; large lists are slow and consume rate limit quota.
- **Search on Enter only** — The home search bar does not debounce or search on every keystroke

---

## Potential future improvements

- **Adding GitHub Account Synchromization** — Linking a user's github account can enrich the user's experience, giving the potential to customize the user's experience. Some examples include:
    - Tailored Searching (viewing repos that the user may be interested in)
    - Favorite Repositories linking to similar repositories that the user could be interested in
    - A dashboard where a user can quickly identify open issues in their involved repositories
- **Caching** — Cache search results and repo details in memory (or `sessionStorage`) to reduce duplicate API calls when paginating or revisiting repos.
- **Richer search** — Debounced live search, more filters (stars range, fork count, license), and search query validation with user-facing error messages.
- **Favourites optimisation** — Store minimal cached metadata in `localStorage` to avoid refetching on every favourites page visit
- **Repo details** — Filter out pull requests from the issues table, add closed issues tab, README preview, and commit activity.
- **Accessibility** — Keyboard navigation for the filter drawer, focus trapping, and a dark mode.
- **Testing** — Unit tests for query building / pagination logic and component tests for `RepoList` and `FilterDrawer`.


---

## Tech stack

- [Vue 3](https://vuejs.org/)
- [Vue Router 4](https://router.vuejs.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [GitHub REST API](https://docs.github.com/en/rest)
