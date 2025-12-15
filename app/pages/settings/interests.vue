<script lang="ts" setup>
import InterestEntry from '~/components/Settings/InterestEntry.vue';

definePageMeta({ layout: 'settings' });
const {
  isLoading,
  onSubmit,
  interests,
  handleToggleInterest,
  isInterestActive,
  selectedOne,
  isSubmitting,
} = useInterestsForm();
</script>

<template>
  <div class="flex h-full max-h-screen flex-col overflow-hidden">
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
        <h1 class="text-2xl font-bold">{{ $t('setting.interests.title') }}</h1>
      </header>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ $t('setting.interests.description') }}
      </p>
    </div>
    <form class="mt-3 flex h-full flex-1 flex-col overflow-hidden" @submit.prevent="onSubmit">
      <div
        v-if="interests"
        data-test="interests-container"
        class="scroll-theme flex-1 overflow-y-auto"
      >
        <InterestEntry
          v-for="interest in interests"
          :key="interest.code"
          :interest="interest"
          :is-active="isInterestActive(interest.code)"
          @toggle-interest="handleToggleInterest(interest.code)"
        />
      </div>
      <div v-if="isLoading" class="flex flex-1 items-center justify-center overflow-y-auto">
        <UiSpinner class="text-primary" />
      </div>
      <UiButton
        class="m-4"
        size="lg"
        variant="default"
        type="submit"
        :disabled="isLoading || !selectedOne || isSubmitting"
        data-cy="save-interests-button"
      >
        {{ $t('ui.save') }}
      </UiButton>
    </form>
  </div>
</template>

<style scoped>
.scroll-theme {
  scrollbar-color: rgb(185, 202, 211) rgb(247, 249, 249);
}
.dark .scroll-theme {
  scrollbar-color: rgb(62, 65, 68) rgb(22, 24, 28);
}
</style>
