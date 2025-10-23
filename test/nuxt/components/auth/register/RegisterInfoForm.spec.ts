import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createPinia, setActivePinia } from 'pinia';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
// import RegisterationInfoForm from '~/components/auth/register/RegisterationInfoForm.vue';
import Dialog from '~/components/ui/dialog/Dialog.vue';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import { reactive } from 'vue';

async function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('RegisterInfoForm.vue', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('fields render correctly', async () => {
    const { default: RegisterationInfoForm } = await import(
      '@/components/auth/register/RegisterationInfoForm.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { RegisterationInfoForm, Dialog },
        template: `
			<Dialog open>
				<RegisterationInfoForm />
			</Dialog>
			`,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );

    const nameField = wrapper.find('input[name="name"]');
    const emailField = wrapper.find('input[name="email"]');
    expect(nameField.exists()).toBe(true);
    expect(emailField.exists()).toBe(true);
  });

  it('shows validation errors on invalid email or already exists', async () => {
    const store = reactive({
      submitRegisterationInfo: vi.fn(),
      checkEmailExists: vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
    });
    const registerationService = reactive({
      checkEmail: vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
    });

    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));
    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => store,
    }));

    const { default: RegisterationInfoForm } = await import(
      '@/components/auth/register/RegisterationInfoForm.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { RegisterationInfoForm, Dialog },
        template: `
      <Dialog open>
        <RegisterationInfoForm />
      </Dialog>
      `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );
    const emailField = wrapper.find('input[name="email"]');
    // First: invalid
    await emailField.setValue('');
    await emailField.trigger('blur');
    await flushPromises();
    let errorMessage = wrapper.find('[data-test-id="email-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.INVALID_EMAIL'));

    // Second: valid
    await emailField.setValue('john.doe@example.com');
    await emailField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="email-error"]');
    expect(errorMessage.exists()).toBe(false);

    // Third: already exists
    await emailField.setValue('test@example.com');
    await emailField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="email-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe(i18n.global.t('errors.EMAIL_ALREADY_EXISTS'));

    // Fourth: change email to non-existing
    await emailField.setValue('john.doe@example.com');
    await emailField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="email-error"]');
    expect(errorMessage.exists()).toBe(false);
  });

  it('shows validation errors on invalid name input', async () => {
    const { default: RegisterationInfoForm } = await import(
      '@/components/auth/register/RegisterationInfoForm.vue'
    );
    const wrapper = await mountSuspended(
      {
        components: { RegisterationInfoForm, Dialog },
        template: `
      <Dialog open>
        <RegisterationInfoForm />
      </Dialog>
      `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );
    const nameField = wrapper.find('input[name="name"]');
    // First: invalid
    await nameField.setValue('');
    await nameField.trigger('blur');
    await flushPromises();
    let errorMessage = wrapper.find('[data-test-id="name-error"]');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe("What's your name?");

    // Second: valid
    await nameField.setValue('A');
    await nameField.trigger('blur');
    await flushPromises();
    errorMessage = wrapper.find('[data-test-id="name-error"]');
    expect(errorMessage.exists()).toBe(false);
  });

  it('submits form with valid input', async () => {
    const store = reactive({
      submitRegisterationInfo: vi.fn(),
    });
    const registerationService = reactive({
      checkEmail: vi.fn().mockResolvedValue(false),
    });

    vi.doMock('@/services/auth/registerationService', () => ({
      registerationService,
    }));

    vi.doMock('@/stores/register', () => ({
      useRegisterStore: () => store,
    }));

    const { default: RegisterationInfoForm } = await import(
      '@/components/auth/register/RegisterationInfoForm.vue'
    );

    const wrapper = await mountSuspended(
      {
        components: { RegisterationInfoForm, Dialog },
        template: `
      <Dialog open>
        <RegisterationInfoForm />
      </Dialog>
      `,
      },
      {
        global: {
          plugins: [i18n],
        },
      },
    );
    const nameField = wrapper.find('input[name="name"]');
    const emailField = wrapper.find('input[name="email"]');
    const monthField = wrapper.find('select[name="birth-month"]');
    const dayField = wrapper.find('select[name="birth-day"]');
    const yearField = wrapper.find('select[name="birth-year"]');
    const form = wrapper.find('form');

    await nameField.setValue('John Doe');
    await emailField.setValue('john.doe2@example.com');
    await monthField.setValue('5');
    await dayField.setValue('4');
    await yearField.setValue('2005');
    await form.trigger('submit');
    await flushPromises();
    expect(store.submitRegisterationInfo).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe2@example.com',
      birthDate: '2005-05-04',
    });
  });
});
