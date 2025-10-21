import { ref, computed, watch } from 'vue';

export default function useDateSelect(
  startYear = 1900,
  endYear = new Date().getFullYear(),
  initialDate?: Date,
) {
  const selectedMonth = ref<number | undefined>(initialDate ? initialDate.getMonth() : undefined);
  const selectedDay = ref<number | undefined>(initialDate ? initialDate.getDate() : undefined);
  const selectedYear = ref<number | undefined>(initialDate ? initialDate.getFullYear() : undefined);

  const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const getDaysInMonth = (year: number | undefined, month: number | undefined) => {
    if (!month) return 31;
    if (!year) year = 2024;
    return new Date(year, month, 0).getDate();
  };

  const months = computed(() =>
    Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(0, i)),
    })),
  );

  const days = computed(() => {
    const max = getDaysInMonth(selectedYear.value, selectedMonth.value);
    return Array.from({ length: max }, (_, i) => ({
      value: i + 1,
      label: String(i + 1),
    }));
  });

  const years = computed(() => {
    const list = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();
    if (selectedMonth.value === 2 && selectedDay.value === 29) {
      return list.filter((y) => isLeapYear(y)).map((y) => ({ value: y, label: String(y) }));
    }
    return list.map((y) => ({ value: y, label: String(y) }));
  });

  watch(selectedMonth, (month) => {
    if (month != undefined) selectedDay.value = undefined;
  });

  watch([selectedMonth, selectedYear], ([month, year]) => {
    if (!month || !year) return;
    const max = getDaysInMonth(year, month);
    if (selectedDay.value && selectedDay.value > max) {
      selectedDay.value = max;
    }
  });

  return {
    selectedMonth,
    selectedDay,
    selectedYear,
    months,
    days,
    years,
  };
}
