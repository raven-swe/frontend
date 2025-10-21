<script setup lang="ts">
import ProfilePictureDialog from '~/components/profile/setup/ProfilePictureDialog.vue';
import LocationDialog from '~/components/profile/setup/LocationDialog.vue';
import BioDialog from '~/components/profile/setup/BioDialog.vue';
import ConfirmationDialog from '~/components/profile/setup/ConfirmationDialog.vue';
</script>

<template>
  <div>
    <ProfilePictureDialog />
    <LocationDialog />
    <BioDialog />
    <ConfirmationDialog />
  </div>
</template>
