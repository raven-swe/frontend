<script lang="ts" setup>
import EditUsernameDialog from '~/components/profile/account-setup/EditUsernameDialog.vue';
import FollowUserDialog from '~/components/profile/account-setup/FollowUserDialog.vue';
import SelectInterestsDialog from '~/components/profile/account-setup/SelectInterestsDialog.vue';
import ProfilePictureDialog from '~/components/profile/setup/ProfilePictureDialog.vue';

const { setupStep, handleProfilePictureSubmit } = useAccountSetup();
</script>

<template>
  <div>
    <ProfilePictureDialog
      :open="setupStep === 'profile-picture'"
      disable-close
      @submit="handleProfilePictureSubmit"
    />
    <EditUsernameDialog :open="setupStep === 'username'" />
    <SelectInterestsDialog :open="setupStep === 'interests'" />
    <FollowUserDialog :open="setupStep === 'follow-user'" />
  </div>
</template>
