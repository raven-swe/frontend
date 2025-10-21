<script lang="ts" setup>
import { useProfileSetupFlow } from '~/composables/useProfileSetupFlow';
import ProfilePictureDialog from '~/components/profile/setup/ProfilePictureDialog.vue';
import LocationDialog from '~/components/profile/setup/LocationDialog.vue';
import BioDialog from '~/components/profile/setup/BioDialog.vue';

definePageMeta({
  layout: 'profile',
});

const {
  isProfilePictureDialogOpen,
  isBioDialogOpen,
  isLocationDialogOpen,
  startFlow,
  nextStep,
  setProfilePicture,
  setBio,
  setLocation,
  closeFlow,
} = useProfileSetupFlow();

const handleProfilePictureSubmit = (image: string | null) => {
  setProfilePicture(image);
  nextStep();
};

const handleBioSubmit = (bio: string | null) => {
  setBio(bio);
  nextStep();
};

const handleLocationSubmit = (location: string | null) => {
  setLocation(location);
  nextStep();
};

const handleDialogClose = () => {
  closeFlow();
};
</script>

<template>
  <div>
    <div class="flex flex-col items-start gap-4 p-8">
      <UiButton variant="outline" size="sm" @click="startFlow">
        {{ $t('profile.setup.setup-profile') }}
      </UiButton>

      <!-- Profile Picture Dialog -->
      <ProfilePictureDialog
        :open="isProfilePictureDialogOpen"
        @submit="handleProfilePictureSubmit"
        @update:open="handleDialogClose"
      />

      <!-- Bio Dialog -->
      <BioDialog
        :open="isBioDialogOpen"
        @submit="handleBioSubmit"
        @update:open="handleDialogClose"
      />

      <!-- Location Dialog -->
      <LocationDialog
        :open="isLocationDialogOpen"
        @submit="handleLocationSubmit"
        @update:open="handleDialogClose"
      />
    </div>
  </div>
</template>
