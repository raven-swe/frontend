<script lang="ts" setup>
defineProps<{
  tweet: Tweet;
}>();
</script>
<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <slot />
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end">
      <UiDropdownMenuItem as-child>
        <NuxtLink :to="`/profile/${tweet.author.username}/status/${tweet.id}/likes`">
          <Icon name="ion:stats-chart" />{{ $t('tweet.engagement.label') }}
        </NuxtLink>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
