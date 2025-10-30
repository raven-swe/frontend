<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import TweetEditor from './TweetEditor.vue';
import Toolbar from './Toolbar.vue';

const tweetContent = ref('');
const tweetEditorRef = ref<InstanceType<typeof TweetEditor> | null>(null);
const userStore = useUserStore();

const MAX_LENGTH = 280;

const characterCount = computed(() => tweetContent.value.length);
const isOverLimit = computed(() => characterCount.value > MAX_LENGTH);

const handlePost = () => {
  if (tweetContent.value.trim() && !isOverLimit.value) {
    // eslint-disable-next-line no-console
    console.log(tweetContent.value);
    tweetContent.value = '';
    tweetEditorRef.value?.resetHeight();
  }
};
</script>

<template>
  <div class="bg-background border-border max-w-[598px] rounded-lg border p-4">
    <div class="mb-3 flex gap-3">
      <div class="flex-shrink-0">
        <img
          :src="userStore.user?.avatarUrl"
          :alt="$t('tweet.composer.profile-alt', { name: userStore.user?.username || '' })"
          class="h-12 w-12 rounded-full object-cover"
        />
      </div>
      <TweetEditor
        ref="tweetEditorRef"
        v-model="tweetContent"
        :placeholder="$t('tweet.composer.placeholder')"
        :max-length="MAX_LENGTH"
      />
    </div>

    <Toolbar
      :disabled="!tweetContent.trim()"
      :character-count="characterCount"
      :max-length="MAX_LENGTH"
      :is-over-limit="isOverLimit"
      @post="handlePost"
    />
  </div>
</template>
