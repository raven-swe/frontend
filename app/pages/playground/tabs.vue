<script setup lang="ts">
import Tab from '@/components/ui/Tab.vue';
import Tabs from '@/components/ui/Tabs.vue';
</script>

<template>
  <div>
    <Tabs>
      <Tab
        label="For you"
        route="/playground/tabs"
        :is-active="$route.path === '/playground/tabs'"
      />
      <Tab label="Following" route="/playground/tabs" :is-active="$route.path === 'false'" />
    </Tabs>
    <Tabs class="tabs-container">
      <Tab
        label="Posts"
        route="/playground/buttons"
        :is-active="$route.path === '/playground/buttons'"
      />
      <Tab
        label="Replies"
        route="/playground/tabs"
        :is-active="$route.path === '/playground/tabs'"
      />
      <Tab label="Media" route="/playground/tabs" :is-active="$route.path === 'false'" />
      <Tab label="Likes" route="/playground/tabs" :is-active="$route.path === 'false'" />
    </Tabs>
  </div>
</template>

<style scoped>
.tabs-container {
  max-width: 600px;
  margin: 10rem auto;
}
</style>
