<script lang="ts" setup></script>

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

          <!-- settings Section -->
          <SettingsSettingsSection
            class="hidden w-[320px] flex-shrink-0 lg:block xl:w-[390px] 2xl:w-[450px]"
          />

          <!-- Right sidebar -->
          <div class="border-border bg-blue flex-1 border-x sm:w-[570px] sm:flex-none md:w-[600px]">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
