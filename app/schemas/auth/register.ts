import z from 'zod';
export const step1Schema = z.object({
  email: z.email($t('errors.INVALID_EMAIL')),
  name: z.string().min(2, $t('errors.NAME_TOO_SHORT')),
  birthDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - parsedDate.getFullYear();
    return age >= 13;
  }, $t('errors.AGE_RESTRICTION')),
});

export type Step1Data = z.infer<typeof step1Schema>;

export const step2Schema = z.object({
  otp: z.string().length(6, $t('errors.OTP_LENGTH')),
});

export type Step2Data = z.infer<typeof step2Schema>;

export const step3Schema = z
  .object({
    password: z.string().min(8, $t('errors.PASSWORD_TOO_SHORT')),
  })
  .refine(
    (data) =>
      data.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    $t('errors.PASSWORD_INVALID'),
  );

export type Step3Data = z.infer<typeof step3Schema>;
