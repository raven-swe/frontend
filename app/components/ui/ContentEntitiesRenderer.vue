<script lang="ts" setup>
const props = defineProps<{
  content: string;
  entities: ContentEntities | null | undefined;
}>();

const parsedBioTokens = computed(() => parseContentEntities(props.content, props.entities));
</script>
<template>
  <template v-for="token in parsedBioTokens" :key="token.key">
    <span v-if="token.type === 'text'" :key="token.key">
      {{ token.display }}
    </span>
    <NuxtLink
      v-else-if="token.type === 'mention'"
      :to="`/profile/${token.value}`"
      class="text-primary hover:underline"
      @click.stop
    >
      {{ token.display }}
    </NuxtLink>
    <NuxtLink
      v-else-if="token.type === 'hashtag'"
      :to="`/search/top?q=${encodeURIComponent('#' + token.value)}`"
      class="text-primary hover:underline"
      @click.stop
    >
      {{ token.display }}
    </NuxtLink>
    <NuxtLink
      v-else-if="token.type === 'link'"
      :to="token.value"
      class="text-primary hover:underline"
      external
      @click.stop
    >
      {{ token.display }}
    </NuxtLink>
  </template>
</template>
