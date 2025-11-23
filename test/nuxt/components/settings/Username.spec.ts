import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref, reactive, computed } from 'vue';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';

// i18n mock
mockNuxtImport('useI18n', () => {
  return () => ({
    t: (k: string) => k,
    locale: ref('en'),
  });
});

// Router mock
const pushSpy = vi.fn();
const replaceSpy = vi.fn();
mockNuxtImport('useRouter', () => {
  return () => ({ push: pushSpy, replace: replaceSpy });
});

// User store mock
const updateUserSpy = vi.fn();
let userStoreData: { user: { username?: string }; updateUser: (u: { username: string }) => void };
mockNuxtImport('useUserStore', () => {
  return () => userStoreData;
});

// Debounce mock -> run immediately
vi.mock('@vueuse/core', () => ({
  useDebounceFn: (fn: (...args: unknown[]) => unknown) => fn,
}));

// apiFetch mock (suggestions + update username) - hoist-safe
type ApiResponse<T> = Promise<{ data: T }>;
let suggestionsList: string[] = [];
let patchShouldFail = false;
const hoisted = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));
vi.mock('~/api', () => ({ apiFetch: hoisted.apiFetchMock }));

// $fetch mock (check-identifier)
let checkExists = false;
// do not declare globals to avoid type conflicts; assign at runtime instead

// vee-validate mock with spies we can assert on
let setFieldErrorSpy = vi.fn();
let setFieldValueSpy = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let validationSchema: any = null;
vi.mock('vee-validate', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm: (config?: { validationSchema?: any; initialValues?: any }) => {
      validationSchema = config?.validationSchema || null;
      const errors = ref<Record<string, string>>({});
      const values = reactive<{ username: string }>({
        username: config?.initialValues?.username || userStoreData.user.username || '',
      });
      const setFieldError = (field: string, msg: string) => {
        errors.value[field] = String(msg);
        setFieldErrorSpy(field, msg);
      };
      const setFieldValue = (field: string, val: string) => {
        // this form only uses "username"
        if (field === 'username') values.username = val;
        setFieldValueSpy(field, val);
      };
      const defineField = (_name: string) => {
        // simplified single-field implementation - use computed to keep reactive
        const model = computed({
          get: () => values.username,
          set: async (v: string) => {
            values.username = v;
            // Trigger validation when schema exists
            if (validationSchema) {
              try {
                await validationSchema.validate({ username: v });
                errors.value.username = '';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err: any) {
                errors.value.username = err.message;
                setFieldErrorSpy('username', err.message);
              }
            }
          },
        });
        const attrs: Record<string, (v: string) => void> = {
          'onUpdate:modelValue': async (v: string) => {
            values.username = v;
            // Trigger validation when schema exists
            if (validationSchema) {
              try {
                await validationSchema.validate({ username: v });
                errors.value.username = '';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err: any) {
                errors.value.username = err.message;
                setFieldErrorSpy('username', err.message);
              }
            }
          },
        };
        return [model, attrs] as const;
      };
      const handleSubmit = (cb: (v: { username: string }) => unknown) => {
        return async () => {
          await cb(values);
        };
      };
      const isSubmitting = ref(false);
      return {
        errors,
        values,
        defineField,
        handleSubmit,
        isSubmitting,
        setFieldError,
        setFieldValue,
      };
    },
  };
});

// Component stubs
const FieldInputStub = {
  name: 'FieldInput',
  template:
    '<input data-testid="field" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  props: ['modelValue', 'name', 'placeholder'],
  emits: ['update:modelValue'],
};
const ButtonStub = {
  template: '<button data-testid="submit" type="submit"><slot /></button>',
};
const IconStub = {
  name: 'Icon',
  template: '<i data-testid="icon" @click="$emit(\'click\')" />',
  props: ['name', 'size', 'to'],
  emits: ['click'],
};

/* eslint-disable import/first */
import UsernamePage from '@/pages/settings/account/username.vue';
/* eslint-enable import/first */

describe('Settings Username Page', () => {
  beforeEach(() => {
    // reset globals/mocks
    userStoreData = { user: { username: 'current' }, updateUser: updateUserSpy };
    updateUserSpy.mockReset();
    pushSpy.mockReset();
    suggestionsList = ['alice', 'bob'];
    patchShouldFail = false;
    hoisted.apiFetchMock.mockReset();
    hoisted.apiFetchMock.mockImplementation(
      <T>(url: string, _opts?: Record<string, unknown>): ApiResponse<T> => {
        if (url.includes('/api/settings/username/suggestions')) {
          return Promise.resolve({ data: { suggestions: suggestionsList } as unknown as T });
        }
        if (url.includes('/api/settings/username/update')) {
          if (patchShouldFail)
            return Promise.reject(new Error('fail')) as unknown as ApiResponse<T>;
          return Promise.resolve({ data: {} as unknown as T });
        }
        return Promise.resolve({ data: {} as unknown as T });
      },
    );
    setFieldErrorSpy = vi.fn();
    setFieldValueSpy = vi.fn();
    checkExists = false;
    type FetchMock = (url: string, opts?: Record<string, unknown>) => Promise<unknown>;
    (globalThis as unknown as { $fetch: FetchMock }).$fetch = vi.fn(async (url: string) => {
      if (url.includes('/api/auth/check-identifier')) {
        return { data: { exists: checkExists, type: 'username' } };
      }
      return {};
    });
  });

  it('renders header and suggestions, clicking a suggestion sets the username field', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: {
        stubs: {
          FieldInput: FieldInputStub,
          Button: ButtonStub,
          Icon: IconStub,
        },
      },
    });

    // Header - Icon renders as span.iconify
    const icon = wrapper.find('.iconify');
    expect(icon.exists()).toBe(true);
    const title = wrapper.html();
    expect(title).toContain('setting.username.change-username');

    // Suggestions
    expect(wrapper.html()).toContain('alice');
    expect(wrapper.html()).toContain('bob');

    // Click on first suggestion button
    const suggestionButton = wrapper.findAll('button').find((btn) => btn.text() === 'alice');
    expect(suggestionButton).toBeDefined();
    await suggestionButton!.trigger('click');
    await wrapper.vm.$nextTick();
    expect(setFieldValueSpy).toHaveBeenCalledWith('username', 'alice');
  });

  it('checks availability and sets field error when username exists', async () => {
    checkExists = true; // simulate taken username
    const wrapper = await mountSuspended(UsernamePage, {
      global: {
        stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub },
        mocks: { $t: (k: string) => k },
      },
    });

    // Change the input value to trigger the availability check
    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('taken_name');
    await wrapper.vm.$nextTick();

    // Since debounce is mocked to immediate, error should be set
    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'setting.username.username-taken');
    // and check endpoint was called
    expect(globalThis.$fetch).toHaveBeenCalled();
  });

  it('handles suggestions fetch failure gracefully (no suggestions rendered)', async () => {
    // Force apiFetch to throw for suggestions endpoint only
    hoisted.apiFetchMock.mockImplementation(<T>(url: string): ApiResponse<T> => {
      if (url.includes('/api/settings/username/suggestions')) {
        return Promise.reject(new Error('network')) as unknown as ApiResponse<T>;
      }
      return Promise.resolve({ data: {} as unknown as T });
    });

    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    // suggestions buttons should not include original sample values
    expect(wrapper.html()).not.toContain('alice');
    expect(wrapper.html()).not.toContain('bob');
  });

  it('sets error when username availability check request fails', async () => {
    // Mock $fetch to throw for identifier check
    (globalThis.$fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async (url: string) => {
        if (url.includes('/api/auth/check-identifier')) {
          throw new Error('fail-check');
        }
        return {};
      },
    );

    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('someName');
    await wrapper.vm.$nextTick();

    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'errors.username.error-checking');
  });

  it('does not submit when username exists (early return in submit handler)', async () => {
    checkExists = true; // taken
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('taken_name');
    await wrapper.vm.$nextTick();
    // debounce immediate so taken state set
    await wrapper.get('form').trigger('submit');
    await wrapper.vm.$nextTick();

    // Should not call PATCH update endpoint
    expect(hoisted.apiFetchMock).not.toHaveBeenCalledWith(
      '/api/settings/username/update',
      expect.anything(),
    );
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it('disables submit button while checking or when errors present', async () => {
    // Force identifier check to be slow by returning promise that never resolves immediately
    let resolveFn: () => void;
    (globalThis.$fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async (url: string) => {
        if (url.includes('/api/auth/check-identifier')) {
          return new Promise((resolve) => {
            resolveFn = () => resolve({ data: { exists: false, type: 'username' } });
          });
        }
        return {};
      },
    );

    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });
    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('checking_name');
    await wrapper.vm.$nextTick();

    const submitBtn = wrapper.get('[data-testid="submit"]');
    expect(submitBtn.attributes('disabled')).toBeDefined();

    // Finish check
    resolveFn!();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    // Button should be enabled now (no errors, not checking) - could be undefined or empty string
    const disabledAttr = submitBtn.attributes('disabled');
    expect(disabledAttr === undefined || disabledAttr === '').toBe(true);
  });

  it('disables submit button when username is taken (usernameExists true)', async () => {
    checkExists = true;
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('taken_name');
    await wrapper.vm.$nextTick();
    // Wait a tick for availability logic
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const submitBtn = wrapper.get('[data-testid="submit"]');
    expect(submitBtn.attributes('disabled')).toBeDefined();
  });

  it('skips availability check when an existing validation error is present', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    // Manually inject a validation error (mock form exposes errors ref via instance)
    // This simulates schema validation failure prior to availability check.
    // @ts-expect-error accessing internal ref for test
    wrapper.vm.errors.value.username = 'any-error';

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('newvalue');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    // Availability check should be skipped.
    expect(globalThis.$fetch).not.toHaveBeenCalled();
  });

  it('skips availability check for empty username', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));
    expect(globalThis.$fetch).not.toHaveBeenCalled();
  });

  it('submits successfully: updates user and navigates', async () => {
    checkExists = false;
    const wrapper = await mountSuspended(UsernamePage, {
      global: {
        stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub },
        mocks: { $t: (k: string) => k },
      },
    });

    // Change username to a new available value
    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('new_name');
    await wrapper.vm.$nextTick();

    // Wait for debounced check to complete (even though it's immediate, it's still async)
    await new Promise((resolve) => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    // Submit form
    const form = wrapper.get('form');
    await form.trigger('submit');

    // Wait for all pending promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();

    // api called and store updated, then navigated
    expect(hoisted.apiFetchMock).toHaveBeenCalledWith(
      '/api/settings/username/update',
      expect.any(Object),
    );
    expect(updateUserSpy).toHaveBeenCalledWith({ username: 'new_name' });
    // Error handler should NOT have been called
    expect(setFieldErrorSpy).not.toHaveBeenCalledWith('username', expect.anything());
    expect(pushSpy).toHaveBeenCalledWith('/settings/account');
  });

  it('shows error when submit fails', async () => {
    patchShouldFail = true;
    checkExists = false;
    const wrapper = await mountSuspended(UsernamePage, {
      global: {
        stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub },
        mocks: { $t: (k: string) => k },
      },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('oops');
    await wrapper.vm.$nextTick();

    await wrapper.get('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'setting.username.error-saving');
  });

  it('clicking the back icon navigates to settings account page', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: {
        stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub },
      },
    });

    const icon = wrapper.find('.iconify');
    expect(icon.exists()).toBe(true);
    await icon.trigger('click');
    await wrapper.vm.$nextTick();

    expect(pushSpy).toHaveBeenCalledWith('/settings/account');
  });

  it('reinstates username-taken error when validation error clears but username is still marked as taken', async () => {
    checkExists = true;
    const wrapper = await mountSuspended(UsernamePage, {
      global: {
        stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub },
      },
    });

    const field = wrapper.get('[data-testid="field"]');

    // Set a username that will be marked as taken
    await field.setValue('taken_name');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 50));

    // Verify it's marked as taken
    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'setting.username.username-taken');
    setFieldErrorSpy.mockClear();

    // Manually clear the error to simulate validation clearing it
    // @ts-expect-error accessing internal ref for test
    wrapper.vm.errors.value.username = '';
    await wrapper.vm.$nextTick();

    // Trigger the errors watcher by setting a new error object
    // @ts-expect-error accessing internal ref for test
    wrapper.vm.errors.value = { ...wrapper.vm.errors.value };
    await wrapper.vm.$nextTick();

    // The watcher should reinstate the error since usernameExists is still true
    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'setting.username.username-taken');
  });

  it('dynamically updates suggestions when typing a new valid username', async () => {
    // Track calls to differentiate initial vs dynamic suggestions
    let suggestionCallCount = 0;
    hoisted.apiFetchMock.mockImplementation(<T>(url: string): ApiResponse<T> => {
      if (url.includes('/api/settings/username/suggestions')) {
        suggestionCallCount++;
        if (suggestionCallCount === 1) {
          // initial fetch
          return Promise.resolve({ data: { suggestions: ['alice', 'bob'] } as unknown as T });
        }
        // dynamic fetch after user types new username
        return Promise.resolve({
          data: { suggestions: ['freshname1', 'freshname2'] } as unknown as T,
        });
      }
      return Promise.resolve({ data: {} as unknown as T });
    });

    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    // initial suggestions rendered
    expect(wrapper.html()).toContain('alice');
    expect(wrapper.html()).toContain('bob');

    // Type a new username to trigger dynamic suggestions watcher
    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('freshname');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));

    // dynamic suggestions replace previous ones
    const html = wrapper.html();
    expect(html).toContain('freshname1');
    expect(html).toContain('freshname2');
    expect(html).not.toContain('alice');
  });

  it('handles dynamic suggestions fetch failure gracefully (after typing)', async () => {
    let suggestionCallCount = 0;
    hoisted.apiFetchMock.mockImplementation(<T>(url: string): ApiResponse<T> => {
      if (url.includes('/api/settings/username/suggestions')) {
        suggestionCallCount++;
        if (suggestionCallCount === 1) {
          return Promise.resolve({ data: { suggestions: ['base1'] } as unknown as T });
        }
        // fail dynamic fetch
        return Promise.reject(new Error('dynamic-fail')) as unknown as ApiResponse<T>;
      }
      return Promise.resolve({ data: {} as unknown as T });
    });

    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });
    expect(wrapper.html()).toContain('base1');
    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('newtyped');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));

    // Should still show initial suggestion, no new ones added
    const html = wrapper.html();
    expect(html).toContain('base1');
    expect(html).not.toContain('newtyped1');
  });

  it('disables submit button when isSubmitting is manually set (simulated)', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });
    const submitBtn = wrapper.get('[data-testid="submit"]');
    // Initially enabled
    expect(submitBtn.attributes('disabled')).toBeUndefined();
    // Simulate internal isSubmitting state true
    // @ts-expect-error test-side mutation of internal ref
    wrapper.vm.isSubmitting.value = true;
    await wrapper.vm.$nextTick();
    expect(submitBtn.attributes('disabled')).toBeDefined();
    // Reset
    // @ts-expect-error test-side mutation of internal ref
    wrapper.vm.isSubmitting.value = false;
    await wrapper.vm.$nextTick();
    expect(submitBtn.attributes('disabled')).toBeUndefined();
  });

  it('validates username required field (empty username)', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'setting.username.username-required');
  });

  it('validates username minimum length (less than 3 characters)', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('ab');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'setting.username.username-invalid');
  });

  it('validates username maximum length (more than 15 characters)', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('a'.repeat(16));
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'setting.username.username-invalid');
  });

  it('validates username pattern (only alphanumeric and underscore)', async () => {
    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('user@name');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    expect(setFieldErrorSpy).toHaveBeenCalledWith('username', 'setting.username.username-invalid');
  });

  it('covers dynamic suggestions success path with data.suggestions check', async () => {
    let dynamicCallCount = 0;
    hoisted.apiFetchMock.mockImplementation(<T>(url: string): ApiResponse<T> => {
      if (url.includes('/api/settings/username/suggestions')) {
        dynamicCallCount++;
        if (dynamicCallCount === 1) {
          // initial: return data with suggestions
          return Promise.resolve({ data: { suggestions: ['initial1'] } as unknown as T });
        }
        // second call: also return data with suggestions
        return Promise.resolve({ data: { suggestions: ['dynamic1', 'dynamic2'] } as unknown as T });
      }
      return Promise.resolve({ data: {} as unknown as T });
    });

    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    expect(wrapper.html()).toContain('initial1');

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('validname');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    const html = wrapper.html();
    expect(html).toContain('dynamic1');
    expect(html).toContain('dynamic2');
  });

  it('covers dynamic suggestions error path (console.error branch)', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let dynamicCallCount = 0;
    hoisted.apiFetchMock.mockImplementation(<T>(url: string): ApiResponse<T> => {
      if (url.includes('/api/settings/username/suggestions')) {
        dynamicCallCount++;
        if (dynamicCallCount === 1) {
          return Promise.resolve({ data: { suggestions: ['base'] } as unknown as T });
        }
        // second call: throw error
        return Promise.reject(new Error('dynamic-error')) as unknown as ApiResponse<T>;
      }
      return Promise.resolve({ data: {} as unknown as T });
    });

    const wrapper = await mountSuspended(UsernamePage, {
      global: { stubs: { FieldInput: FieldInputStub, Button: ButtonStub, Icon: IconStub } },
    });

    const field = wrapper.get('[data-testid="field"]');
    await field.setValue('triggererror');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Could not load username suggestions:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});
