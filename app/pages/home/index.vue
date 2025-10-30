<script lang="ts"></script>

<template>
  <div>
    <UiTabs>
      <UiTab label="For you" route="/" :is-active="true" />
      <UiTab label="Following" route="/" :is-active="$route.path === 'false'" />
    </UiTabs>
    <TweetComposer />
    <h1 class="p-4 text-2xl font-bold">{{ $t('homepage.tweets') }}</h1>
  </div>
</template>
