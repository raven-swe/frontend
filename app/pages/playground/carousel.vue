<script lang="ts" setup></script>
<template>
  <div>
    <UiCarousel class="mx-16" orientation="horizontal">
      <UiCarouselContent class="h-full">
        <UiCarouselItem v-for="n in 5" :key="n">
          <div class="text-foreground flex h-80 items-center justify-center text-3xl font-semibold">
            {{ `Slide ${n}` }}
          </div>
        </UiCarouselItem>
      </UiCarouselContent>
      <UiCarouselPrevious />
      <UiCarouselNext />
    </UiCarousel>
  </div>
</template>
