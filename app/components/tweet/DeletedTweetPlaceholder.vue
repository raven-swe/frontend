<script lang="ts" setup></script>
<template>
  <div
    class="border-border bg-muted/60 text-muted-foreground text-md rounded-xl border p-3 text-start"
    data-cy="deleted-tweet-placeholder"
    v-bind="$props"
  >
    <slot>
      {{ $t('tweet.deleted-quote') }}
    </slot>
  </div>
</template>
