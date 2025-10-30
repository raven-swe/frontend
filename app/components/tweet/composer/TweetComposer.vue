<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';

const tweetContent = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const userStore = useUserStore();

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
};

const handlePost = () => {
  if (tweetContent.value.trim()) {
    // eslint-disable-next-line no-console
    console.log(tweetContent.value);
    tweetContent.value = '';
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  }
};
</script>

<template>
  <div class="bg-background border-border max-w-[598px] rounded-lg border p-4">
    <div class="mb-3 flex gap-3">
      <div class="flex-shrink-0">
        <img
          :src="userStore.user?.avatarUrl"
          :alt="$t('tweet.profile-alt', { name: userStore.user?.username || '' })"
          class="h-12 w-12 rounded-full object-cover"
        />
      </div>
      <div class="max-h-[60vh] min-w-0 flex-1 overflow-y-auto pt-1.5">
        <textarea
          ref="textareaRef"
          v-model="tweetContent"
          :placeholder="$t('tweet.composer.placeholder')"
          class="text-foreground placeholder:text-muted-foreground w-full resize-none border-none bg-transparent text-xl leading-7 outline-none"
          @input="adjustHeight"
        />
      </div>
    </div>

    <!-- should be extracted to a Toolbar component -->
    <div class="border-border ms-[60px] flex items-center justify-between border-t pt-3">
      <div class="flex gap-1">
        <UiButton
          variant="tweet-icon-blue"
          :title="$t('tweet.composer.media')"
          class="text-brand-blue"
          size="icon-md"
        >
          <Icon name="heroicons:photo" size="20" />
        </UiButton>
        <UiButton
          variant="tweet-icon-blue"
          :title="$t('tweet.composer.gif')"
          class="text-brand-blue"
          size="icon-md"
        >
          <Icon name="heroicons:gif-solid" size="20" />
        </UiButton>
        <UiButton
          variant="tweet-icon-blue"
          :title="$t('tweet.composer.emoji')"
          class="text-brand-blue"
          size="icon-md"
        >
          <Icon name="heroicons:face-smile" size="20" />
        </UiButton>
      </div>
      <UiButton size="md" :disabled="!tweetContent.trim()" @click="handlePost">
        {{ $t('ui.post') }}
      </UiButton>
    </div>
  </div>
</template>
