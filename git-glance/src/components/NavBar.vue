
<template>
    <h1 class="flex flex-row justify-between text-2xl font-bold py-10 px-5 border-b-2 border-primary-500 items-center shrink-0">
      <RouterLink class='hover:cursor-pointer hover:underline' to="/">GitGlance</RouterLink>
        <RouterLink class='flex items-center gap-3 hover:cursor-pointer' to="/favourites">
            <span class="material-symbols-outlined text-2xl">
                bookmark
            </span>
        </RouterLink>
    </h1>
</template>