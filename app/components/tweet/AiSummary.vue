<script setup lang="ts">
import { tweetAiSummary } from '~/services/tweet/tweetsService';
interface Props {
  tweetId: string;
}
const props = defineProps<Props>();
const { locale } = useI18n();
const aiSummary = ref<string | null>(null);
const showAiSummary = ref(false);
const aiSummaryLoading = ref(false);
const aiSummaryError = ref(false);
function closeSummary() {
  showAiSummary.value = false;
}
async function handleAiSummary() {
  try {
    aiSummaryLoading.value = true;
    aiSummaryError.value = false;
    const res = await tweetAiSummary(props.tweetId, locale.value);
    if (res.success && res.data.summary) {
      aiSummary.value = res.data.summary;
      showAiSummary.value = true;
    } else {
      showAiSummary.value = false;
    }
  } catch (error) {
    console.error('Error fetching AI summary:', error);
    aiSummaryError.value = true;
  } finally {
    aiSummaryLoading.value = false;
  }
}

defineExpose({ handleAiSummary });
</script>

<template>
  <div class="mt-2">
    <!-- Skeleton shimmer while loading -->
    <div
      v-if="aiSummaryLoading"
      class="ai-summary-bg ai-summary-anim space-y-2 rounded-xl p-3"
      data-cy="tweet-ai-summary-loading"
    >
      <div class="skeleton-shimmer h-3 w-10/12 rounded"></div>
      <div class="skeleton-shimmer h-3 w-9/12 rounded"></div>
      <div class="skeleton-shimmer h-3 w-7/12 rounded"></div>
    </div>

    <!-- Error state with icon and retry -->
    <div
      v-else-if="aiSummaryError"
      class="ai-summary-bg ai-summary-anim flex items-center gap-2 rounded-xl p-3"
      data-cy="tweet-ai-summary-error"
    >
      <Icon
        name="material-symbols:error-outline-rounded"
        class="text-destructive"
        size="1.2rem"
        aria-hidden="true"
      />
      <span class="text-foreground/80 text-sm">{{ $t('ai-summary.something-went-wrong') }}</span>
      <UiButton variant="primary" size="sm" class="ms-auto" @click.prevent.stop="handleAiSummary">
        <Icon name="material-symbols:refresh-rounded" size="1rem" aria-hidden="true"></Icon>
        {{ $t('ai-summary.retry') }}
      </UiButton>
    </div>

    <!-- Summary content -->
    <div
      v-else-if="showAiSummary"
      class="ai-summary-bg ai-summary-anim relative rounded-xl p-3"
      data-cy="tweet-ai-summary-container"
    >
      <UiButton
        variant="ghost-default"
        size="icon-xs"
        class="text-foreground/70 hover:text-foreground absolute end-2 top-2 bg-transparent"
        :aria-label="$t('ai-summary.close')"
        data-cy="tweet-ai-summary-close-button"
        @click.prevent.stop="closeSummary"
      >
        <Icon name="material-symbols:close-rounded" size="1rem" aria-hidden="true" />
      </UiButton>
      <h3 class="font-semibold">
        {{ $t('ai-summary.summary') }}
      </h3>
      <p class="text-foreground mt-1 text-sm" data-cy="tweet-ai-summary-content">{{ aiSummary }}</p>
    </div>
  </div>
</template>
<style scoped>
.ai-summary-bg {
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    color-mix(in oklch, var(--brand-blue) 18%, var(--accent)) 30%,
    color-mix(in oklch, var(--brand-turquoise) 18%, var(--accent)) 60%,
    var(--accent) 100%
  );
  background-size: 200% 200%;
}

@keyframes aiGradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.ai-summary-anim {
  animation: aiGradientShift 3s ease-in-out infinite;
}

/* Shimmer skeleton using gradient and animation */
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: transparent; /* let the AI gradient show through */
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in oklch, var(--ring-primary) 25%, transparent) 45%,
    color-mix(in oklch, var(--ring-primary) 35%, transparent) 50%,
    color-mix(in oklch, var(--ring-primary) 25%, transparent) 55%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: skeletonSweep 1.4s ease-in-out infinite;
  mix-blend-mode: lighten;
  opacity: 0.6;
}
@keyframes skeletonSweep {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
