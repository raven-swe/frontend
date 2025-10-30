<script lang="ts" setup>
const whatHappeningItems = [
  {
    title: 'Football',
    count: '18.8k',
  },
  {
    title: '#CodingIsFun',
    count: '8.8k',
  },
  {
    title: '#VueJS',
    count: '1.8k',
  },
];

const whoToFollowItems = [
  {
    name: 'Hussein',
    username: '@hussein',
    image: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Ahmed Amr',
    username: '@btngana',
    image: 'https://i.pravatar.cc/150?img=3',
  },
  {
    name: 'Abdullah Farag',
    username: '@farag',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  {
    name: 'mostafa Hassan',
    username: '@mostafa',
    image: 'https://i.pravatar.cc/150?img=13',
  },
  {
    name: 'Habiba Ayman',
    username: '@habiba',
    image: 'https://i.pravatar.cc/150?img=10',
  },
];
</script>

<template>
  <div class="ms-4">
    <!-- preview Card -->
    <SideBarRightPreviewCard :title="$t('rightsidebar.whats-happening.title')">
      <div>
        <SideBarRightPreviewCardItem
          v-for="(happingItem, index) in whatHappeningItems"
          :key="index"
        >
          <h2 class="text-md text-foreground font-bold">
            {{ happingItem.title }}
          </h2>
          <p class="text-muted-foreground text-sm">
            {{ happingItem.count }} {{ $t('rightsidebar.whats-happening.tweets') }}
          </p>
        </SideBarRightPreviewCardItem>
      </div>
    </SideBarRightPreviewCard>
    <!-- Who to follow -->
    <SideBarRightPreviewCard :title="$t('rightsidebar.who-to-follow.title')">
      <SideBarRightPreviewCardItem
        v-for="whoFollowItem in whoToFollowItems"
        :key="whoFollowItem.username"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-row">
            <img
              :src="whoFollowItem.image"
              :alt="whoFollowItem.name"
              class="h-10 w-10 rounded-full"
            />
            <div class="ms-3 flex flex-col">
              <h1 class="text-md text-foreground font-bold">
                {{ whoFollowItem.name }}
              </h1>
              <p class="text-muted-foreground text-xs">{{ whoFollowItem.username }}</p>
            </div>
          </div>
          <div class="flex h-full">
            <button class="bg-foreground text-background cursor-pointer rounded-full px-4 py-2">
              {{ $t('rightsidebar.who-to-follow.follow') }}
            </button>
          </div>
        </div>
      </SideBarRightPreviewCardItem>
    </SideBarRightPreviewCard>
  </div>
</template>
