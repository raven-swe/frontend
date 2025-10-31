<script lang="ts"></script>

<template>
  <div>
    <UiTabs>
      <UiTab label="For you" route="/home" :is-active="$route.path.startsWith('/home')" />
      <UiTab label="Following" route="/home" :is-active="$route.path === 'false'" />
    </UiTabs>
    <TweetComposer />
    <h1 class="p-4 text-2xl font-bold">{{ $t('homepage.tweets') }}</h1>
  </div>
</template>
