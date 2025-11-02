<script lang="ts" setup>
import EditUsernameDialog from '~/components/profile/account-setup/EditUsernameDialog.vue';
import FollowUserDialog from '~/components/profile/account-setup/FollowUserDialog.vue';
import SelectInterestsDialog from '~/components/profile/account-setup/SelectInterestsDialog.vue';
definePageMeta({
  layout: 'profile',
});

const { setupStep, handleProfilePictureSubmit } = useAccountSetup();
</script>

<template>
  <div>
    <ProfileSetupProfilePictureDialog
      :open="setupStep === 'profile-picture'"
      @submit="handleProfilePictureSubmit"
    />
    <EditUsernameDialog :open="setupStep === 'username'" />
    <SelectInterestsDialog :open="setupStep === 'interests'" />
    <FollowUserDialog :open="setupStep === 'follow-user'" />
  </div>
</template>

<style></style>
