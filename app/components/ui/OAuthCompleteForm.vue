<script setup lang="ts">
import { useOAuthComplete } from '~/composables/useOAuthComplete';
import useDateSelect from '@/composables/useDateSelect';
import Select from '~/components/ui/Select.vue';
import Button from './Button.vue';

const props = defineProps<{ creationToken: string }>();
const birthDate = ref<string>('');
const openDialog = ref(true);
const { loading, submit } = useOAuthComplete();
const today = new Date();
const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
const errors = reactive<Record<string, string>>({});

function onOpenChange(value: boolean) {
  openDialog.value = value;
  if (!value) {
    navigateTo('/');
  }
}
const dateSelect = useDateSelect(new Date().getFullYear() - 100, new Date().getFullYear());

watch(
  [dateSelect.selectedDay, dateSelect.selectedMonth, dateSelect.selectedYear],
  ([day, month, year]) => {
    if (day && month && year) {
      const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      if (date.getDate() === Number(day)) {
        const formattedDate: string = date.toISOString().split('T')[0] || '';
        birthDate.value = formattedDate;
        if (date > thirteenYearsAgo) {
          errors.birthDate = $t('errors.AGE_RESTRICTION');
        } else {
          delete errors.birthDate;
        }
      }
    } else {
      birthDate.value = '';
      delete errors.birthDate;
    }
  },
);

function handleSubmit() {
  submit(props.creationToken, birthDate.value);
}
</script>

<template>
  <div class="flex h-full flex-col justify-between">
    <UiDialog :open="openDialog" data-test-id="oauth-complete-dialog" @update:open="onOpenChange">
      <UiDialogContent>
        <UiDialogHeader class="py-10">
          <UiDialogTitle class="text-4xl font-bold">{{
            $t('register.register-info.title')
          }}</UiDialogTitle>
        </UiDialogHeader>
        <div class="flex flex-col gap-4">
          <div>
            <h2 class="font-semibold">{{ $t('register.register-info.date-of-birth.title') }}</h2>
            <p class="text-muted-foreground mb-4 text-sm">
              {{ $t('register.register-info.date-of-birth.description') }}
            </p>
            <div class="flex gap-2">
              <Select
                v-model="dateSelect.selectedMonth.value"
                class="flex-1/2"
                :options="dateSelect.months.value"
                placeholder="Month"
                name="birth-month"
              />
              <Select
                v-model="dateSelect.selectedDay.value"
                class="flex-1/4"
                :options="dateSelect.days.value"
                placeholder="Day"
                name="birth-day"
              />
              <Select
                v-model="dateSelect.selectedYear.value"
                class="flex-1/4"
                :options="dateSelect.years.value"
                placeholder="Year"
                name="birth-year"
              />
            </div>
            <p
              v-if="errors.birthDate"
              data-test-id="birth-date-error"
              class="text-destructive ps-1 text-xs"
            >
              {{ errors.birthDate }}
            </p>
          </div>
        </div>
        <UiDialogFooter class="mt-auto">
          <Button
            :disabled="!birthDate || !!errors.birthDate || loading"
            size="xl"
            class="w-full"
            @click="handleSubmit"
            >{{ $t('ui.next') }}</Button
          >
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
