<script lang="ts" setup>
import { useProfileSetupFlow } from '~/composables/useProfileSetupFlow';
import ProfilePictureDialog from '~/components/profile/setup/ProfilePictureDialog.vue';
import HeaderDialog from '~/components/profile/setup/HeaderDialog.vue';
import LocationDialog from '~/components/profile/setup/LocationDialog.vue';
import BioDialog from '~/components/profile/setup/BioDialog.vue';
import ConfirmationDialog from '~/components/profile/setup/ConfirmationDialog.vue';

definePageMeta({
  layout: 'profile',
});

const {
  isProfilePictureDialogOpen,
  isHeaderDialogOpen,
  isBioDialogOpen,
  isLocationDialogOpen,
  isConfirmationDialogOpen,
  nextStep,
  setProfilePicture,
  setHeader,
  setBio,
  setLocation,
  closeFlow,
  submitProfile,
} = useProfileSetupFlow();

const handleProfilePictureSubmit = (image: string | null) => {
  setProfilePicture(image);
  nextStep();
};

const handleHeaderSubmit = (header: string | null) => {
  setHeader(header);
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

const handleConfirmationSubmit = async () => {
  closeFlow();
  submitProfile();
};
</script>

<template>
  <div>
    <div>
      <!-- Profile Picture Dialog -->
      <ProfilePictureDialog
        :open="isProfilePictureDialogOpen"
        @submit="handleProfilePictureSubmit"
        @update:open="handleDialogClose"
      />

      <!-- Header Dialog -->
      <HeaderDialog
        :open="isHeaderDialogOpen"
        @submit="handleHeaderSubmit"
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

      <!-- Confirmation Dialog -->
      <ConfirmationDialog :open="isConfirmationDialogOpen" @submit="handleConfirmationSubmit" />
    </div>
  </div>
</template>
