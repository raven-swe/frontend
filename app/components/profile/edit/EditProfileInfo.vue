<script setup lang="ts">
import useDateSelect from '@/composables/useDateSelect';

interface Props {
  name: string;
  bio: string;
  location: string;
  website: string;
  birthDate: Date | undefined;
  isNameValid: boolean;
  isAgeValid: boolean;
  isWebsiteValid: boolean;
}

const emit = defineEmits<{
  'update:name': [value: string];
  'update:bio': [value: string];
  'update:location': [value: string];
  'update:website': [value: string];
  'update:birthDate': [value: Date];
}>();

const props = defineProps<Props>();
// Initialize date selector with existing birth date
const dateSelect = useDateSelect(
  new Date().getFullYear() - 100,
  new Date().getFullYear(),
  props.birthDate,
);

watch(
  () => props.birthDate,
  (date) => {
    if (!date) return;

    const d = new Date(date);

    dateSelect.selectedDay.value = d.getUTCDate();
    dateSelect.selectedMonth.value = d.getUTCMonth() + 1;
    dateSelect.selectedYear.value = d.getUTCFullYear();
  },
  { immediate: true },
);

watch(
  [dateSelect.selectedDay, dateSelect.selectedMonth, dateSelect.selectedYear],
  ([day, month, year]) => {
    if (day && month && year) {
      const newBirthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      if (newBirthDate.getDate() === Number(day)) {
        emit('update:birthDate', newBirthDate);
      }
    }
  },
);
</script>

<template>
  <div class="w-full px-4 pb-6">
    <UiInput
      :model-value="name"
      placeholder="Name"
      :class="isNameValid ? 'mb-6' : 'mb-1'"
      :aria-invalid="!isNameValid"
      data-cy="profile-name-input"
      maxlength="50"
      @update:model-value="emit('update:name', $event as string)"
    />
    <p v-if="!isNameValid" class="text-destructive mb-6 text-sm" role="alert" aria-live="assertive">
      {{ $t('errors.EMPTY_NAME') }}
    </p>

    <uiInput
      :model-value="bio"
      type="textarea"
      :rows="2"
      :placeholder="$t('profile.edit.bio')"
      class="mb-6 w-full"
      maxlength="160"
      data-cy="profile-bio-input"
      @update:model-value="emit('update:bio', $event as string)"
    />

    <uiInput
      :model-value="location"
      type="text"
      :placeholder="$t('profile.edit.location')"
      class="mb-6 w-full"
      maxlength="30"
      data-cy="profile-location-input"
      @update:model-value="emit('update:location', $event as string)"
    />

    <uiInput
      :model-value="website"
      type="text"
      :placeholder="$t('profile.edit.website')"
      :class="isWebsiteValid ? 'mb-6' : 'mb-1'"
      maxlength="100"
      data-cy="profile-website-input"
      @update:model-value="emit('update:website', $event as string)"
    />
    <p
      v-if="!isWebsiteValid"
      class="text-destructive mb-6 text-sm"
      role="alert"
      aria-live="assertive"
      data-cy="invalid-website-url-error"
    >
      {{ $t('errors.INVALID_WEBSITE_URL') }}
    </p>

    <!-- Birth Date Section -->
    <div class="mb-10">
      <h3 class="mb-2 font-medium">{{ $t('profile.edit.birth-date') }}</h3>
      <div class="flex gap-2" data-cy="birth-date-select">
        <uiSelect
          v-model="dateSelect.selectedMonth.value"
          class="flex-1"
          :options="dateSelect.months.value"
          placeholder="Month"
          name="birth-month"
          data-cy="birth-month-select"
        />
        <uiSelect
          v-model="dateSelect.selectedDay.value"
          class="flex-1"
          :options="dateSelect.days.value"
          placeholder="Day"
          name="birth-day"
          data-cy="birth-day-select"
        />
        <uiSelect
          v-model="dateSelect.selectedYear.value"
          class="flex-1"
          :options="dateSelect.years.value"
          placeholder="Year"
          name="birth-year"
          data-cy="birth-year-select"
        />
      </div>
      <p
        v-if="!isAgeValid"
        class="text-destructive mt-2 text-sm"
        role="alert"
        aria-live="assertive"
        data-cy="invalid-age-error"
      >
        {{ $t('errors.birthDate.NOT_MINIMUM_AGE') }}
      </p>
    </div>
  </div>
</template>
