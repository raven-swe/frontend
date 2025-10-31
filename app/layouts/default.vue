<script lang="ts" setup>
import { meService } from '~/services/me/meService';

const { data, error } = await useAsyncData('layout-data', () => meService.fetchProfile());
const userStore = await useUserStore();
if (error.value) {
  userStore.error = error.value.message;
} else if (data.value && data.value.success) {
  userStore.setUser(data.value.data);
  userStore.error = null;
}
</script>

<template>
  <div>
    <div class="bg-background">
      <div class="flex min-h-screen justify-center">
        <div class="flex w-full max-w-7xl sm:justify-center">
          <!-- Left sidebar -->
          <div class="w-16 flex-shrink-0 sm:w-16 md:w-24 xl:w-64">
            <div class="sticky top-0">
              <SideBarLeft />
            </div>
          </div>

          <!-- Main content -->
          <main class="border-border flex-1 border-x sm:w-[560px] sm:flex-none md:w-[600px]">
            <slot />
          </main>

          <!-- Right sidebar -->
          <div class="hidden w-[300px] flex-shrink-0 lg:block xl:w-[350px]">
            <SideBarRight />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
