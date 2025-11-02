<template>
  <div class="mt-2 flex flex-col">
    <div class="px-4">
      <!-- Display name -->
      <div class="bg-muted-foreground/50 h-8 w-48 animate-pulse rounded" />

      <!-- Username -->
      <div class="bg-muted-foreground/50 mt-1 h-5 w-32 animate-pulse rounded" />

      <!-- Bio -->
      <div class="mt-2 space-y-2">
        <div class="bg-muted-foreground/50 h-4 w-full animate-pulse rounded" />
        <div class="bg-muted-foreground/50 h-4 w-3/4 animate-pulse rounded" />
      </div>

      <!-- Website and joined date -->
      <div class="mt-2 flex flex-wrap gap-4">
        <div class="bg-muted-foreground/50 h-4 w-24 animate-pulse rounded" />
        <div class="bg-muted-foreground/50 h-4 w-32 animate-pulse rounded" />
      </div>

      <!-- Following/Followers -->
      <div class="mt-4 flex space-x-4">
        <div class="bg-muted-foreground/50 h-5 w-24 animate-pulse rounded" />
        <div class="bg-muted-foreground/50 h-5 w-24 animate-pulse rounded" />
      </div>
    </div>
  </div>
</template>
