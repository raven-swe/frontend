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
  <div>
    <!-- preview Card -->
    <SideBarRightPreviewCard :title="$t('rightsidebar.whatsHappening.title')">
      <div>
        <SideBarRightPreviewCardItem
          v-for="(happingItem, index) in whatHappeningItems"
          :key="index"
        >
          <h2 class="text-md font-bold text-gray-800 dark:text-white">
            {{ happingItem.title }}
          </h2>
          <p class="text-sm text-gray-400">
            {{ happingItem.count }} {{ $t('rightsidebar.whatsHappening.tweets') }}
          </p>
        </SideBarRightPreviewCardItem>
      </div>
    </SideBarRightPreviewCard>
    <!-- Who to follow -->
    <SideBarRightPreviewCard :title="$t('rightsidebar.whoToFollow.title')">
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
              <h1 class="text-md font-bold text-gray-900 dark:text-white">
                {{ whoFollowItem.name }}
              </h1>
              <p class="text-xs text-gray-500">{{ whoFollowItem.username }}</p>
            </div>
          </div>
          <div class="flex h-full">
            <button
              class="cursor-pointer rounded-full bg-black px-4 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {{ $t('rightsidebar.whoToFollow.follow') }}
            </button>
          </div>
        </div>
      </SideBarRightPreviewCardItem>
    </SideBarRightPreviewCard>
  </div>
</template>
