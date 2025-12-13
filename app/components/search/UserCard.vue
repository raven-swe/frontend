<script setup lang="ts">
import type { CompactUser } from '~~/shared/types/user';

const props = defineProps<{
  user: CompactUser;
}>();
</script>
<template>
  <div class="hover:bg-accent flex cursor-pointer items-center gap-3 p-3 transition-colors">
    <UiAvatar :img="user.avatarUrl" size="sm" />

    <div class="flex-1 overflow-hidden">
      <p class="text-foreground truncate text-sm font-bold">{{ props.user.displayName }}</p>
      <p class="text-muted-foreground truncate text-sm">{{ $t('@') }}{{ props.user.username }}</p>
      <p
        v-if="props.user.relationship.follower || props.user.relationship.following"
        class="text-muted-foreground truncate text-sm"
      >
        <Icon name="material-symbols:person" />
        {{
          props.user.relationship.follower && props.user.relationship.following
            ? $t('ui.you-follow-each-other')
            : props.user.relationship.follower
              ? $t('ui.follows-you')
              : props.user.relationship.following
                ? $t('ui.following')
                : ''
        }}
      </p>
    </div>
  </div>
</template>
