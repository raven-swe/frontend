<script lang="ts" setup></script>

<template>
  <div>
    <div class="p-4">
      <header class="flex flex-row gap-4">
        <UiButton
          variant="ghost-default"
          class="bg-transparent"
          size="icon-sm"
          @click="$router.back()"
        >
          <Icon name="lucide:arrow-left" size="1.2rem" />
        </UiButton>
        <h1 class="text-2xl font-bold">{{ $t('setting.muted.title') }}</h1>
      </header>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.muted.description') }}
      </p>
    </div>
    <div class="mt-3 flex flex-col overflow-hidden"></div>
  </div>
</template>
