<script lang="ts" setup>
import { useTweetDeleteMutation } from '~/composables/tweet/useTweetMutation';
import type { Tweet } from '~~/shared/types/tweets';

const props = defineProps<{
  tweet: Tweet;
  username: string;
}>();

const deleteMutation = useTweetDeleteMutation();
</script>
<template>
  <UiAlertDialog>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <slot />
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="end">
        <UiDropdownMenuItem as-child>
          <NuxtLink
            :to="`/profile/${props.tweet.author.username}/status/${props.tweet.id}/likes`"
            class="ltr:flex-row rtl:flex-row-reverse"
          >
            <Icon name="ion:stats-chart" />{{ $t('tweet.engagement.label') }}
          </NuxtLink>
        </UiDropdownMenuItem>
        <UiDropdownMenuItem as-child @select.prevent>
          <UiAlertDialogTrigger as-child class="text-destructive ltr:flex-row rtl:flex-row-reverse">
            <div v-if="props.username === props.tweet.author.username">
              <Icon name="mi:delete" />
              <p>{{ $t('tweet.delete-tweet') }}</p>
            </div>
          </UiAlertDialogTrigger>
        </UiDropdownMenuItem>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <UiAlertDialogContent>
      <UiAlertDialogHeader>
        <UiAlertDialogTitle>{{ $t('tweet.delete-dialog.title') }}</UiAlertDialogTitle>
        <UiAlertDialogDescription>
          {{ $t('tweet.delete-dialog.description') }}
        </UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <UiAlertDialogFooter>
        <UiAlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="deleteMutation.mutate({ tweetId: props.tweet.id })"
        >
          {{ $t('ui.delete') }}
        </UiAlertDialogAction>
        <UiAlertDialogCancel>{{ $t('ui.cancel') }}</UiAlertDialogCancel>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>
</template>
