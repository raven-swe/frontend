<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import TweetEditor from './TweetEditor.vue';
import Toolbar from './Toolbar.vue';

const tweetContent = ref('');
const tweetEditorRef = ref<InstanceType<typeof TweetEditor> | null>(null);
const userStore = useUserStore();

const handlePost = () => {
  if (tweetContent.value.trim()) {
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
          :alt="$t('tweet.profile-alt', { name: userStore.user?.username || '' })"
          class="h-12 w-12 rounded-full object-cover"
        />
      </div>
      <TweetEditor
        ref="tweetEditorRef"
        v-model="tweetContent"
        :placeholder="$t('tweet.composer.placeholder')"
      />
    </div>

    <Toolbar :disabled="!tweetContent.trim()" @post="handlePost" />
  </div>
</template>
