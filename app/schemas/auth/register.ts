import z from 'zod';
export const registerationInfoSchema = z.object({
  email: z.email($t('errors.INVALID_EMAIL')),
  name: z.string().min(2, $t('errors.NAME_TOO_SHORT')),
  birthDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - parsedDate.getFullYear();
    return age >= 13;
  }, $t('errors.AGE_RESTRICTION')),
});

export type RegisterationInfoSchema = z.infer<typeof registerationInfoSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, $t('errors.OTP_LENGTH')),
});

export type OtpSchemaType = z.infer<typeof otpSchema>;

export const PasswordSchema = z
  .object({
    password: z.string().min(8, $t('errors.PASSWORD_TOO_SHORT')),
  })
  .refine(
    (data) =>
      data.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    $t('errors.PASSWORD_INVALID'),
  );

export type PasswordSchemaType = z.infer<typeof PasswordSchema>;
