<script lang="ts" setup>
const infoData = {
  username: '@hussein',
  name: 'Hussein',
  profilePicture: 'https://i.pravatar.cc/150?img=2',
  joinedDate: 'January 2022',
  followers: '11 Followers',
  followedBy: 'not followed by anyone you follow',
};
</script>
<template>
  <div class="p-4">
    <NuxtLink
      to="/profile/hussein"
      class="hover:bg-foreground/10 flex cursor-pointer flex-col items-center pt-4 pb-20"
    >
      <NuxtImg
        src="https://i.pravatar.cc/150?img=2"
        alt="Profile picture"
        class="z-20 size-14 rounded-full border-1 object-cover"
        loading="eager"
      />
      <span class="text-md font-bold">{{ infoData.name }}</span>
      <span class="text-md text-muted-foreground"> {{ infoData.username }} </span>
      <span class="text-muted-foreground text-sm">
        {{ infoData.joinedDate }} - {{ infoData.followers }}
      </span>
      <span class="text-muted-foreground text-sm"> {{ infoData.followedBy }} </span>
    </NuxtLink>
  </div>
</template>
