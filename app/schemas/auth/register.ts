import z from 'zod';

export const getRegisterationInfoSchema = () => {
  const { $i18n } = useNuxtApp();
  const t = $i18n.t.bind($i18n);
  return z.object({
    email: z.email(t('errors.INVALID_EMAIL')),
    name: z.string().min(2, t('errors.NAME_TOO_SHORT')),
    birthDate: z.string().refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - parsedDate.getFullYear();
      return age >= 13;
    }, t('errors.AGE_RESTRICTION')),
  });
};

export type RegisterationInfoSchema = z.infer<ReturnType<typeof getRegisterationInfoSchema>>;

export const getOtpSchema = () => {
  const { $i18n } = useNuxtApp();
  const t = $i18n.t.bind($i18n);
  return z.object({
    otp: z.string().length(6, t('errors.OTP_LENGTH')),
  });
};

export type OtpSchemaType = z.infer<ReturnType<typeof getOtpSchema>>;

export const getPasswordSchema = () => {
  const { $i18n } = useNuxtApp();
  const t = $i18n.t.bind($i18n);
  return z
    .object({
      password: z.string().min(8, t('errors.PASSWORD_TOO_SHORT')),
    })
    .refine(
      (data) =>
        data.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
      t('errors.PASSWORD_INVALID'),
    );
};
export type PasswordSchemaType = z.infer<ReturnType<typeof getPasswordSchema>>;
