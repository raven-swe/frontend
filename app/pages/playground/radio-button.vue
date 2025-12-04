<script setup lang="ts"></script>

<template>
  <div class="mt-30 flex justify-center">
    <div class="space-y-6">
      <UiRadioGroup default-value="comfortable">
        <div class="flex items-center space-x-2">
          <UiRadioGroupItem id="r1" value="default" />
          <Label for="r1">{{ $t('Default') }}</Label>
        </div>
        <div class="flex items-center space-x-2">
          <UiRadioGroupItem id="r2" value="comfortable" />
          <Label for="r2">{{ $t('Comfortable') }}</Label>
        </div>
        <div class="flex items-center space-x-2">
          <UiRadioGroupItem id="r3" value="compact" />
          <Label for="r3">{{ $t('Compact') }}</Label>
        </div>
      </UiRadioGroup>
    </div>
  </div>
</template>
