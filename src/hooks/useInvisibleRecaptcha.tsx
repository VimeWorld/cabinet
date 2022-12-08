import { useCallback, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

function useInvisibleRecaptcha() {
  const rc = useRef<ReCAPTCHA>(null);
  const value = useRef<string | null>();
  const onExpired = useCallback(() => (value.current = null), [value]);

  return {
    recaptchaComponent: (
      <ReCAPTCHA
        ref={rc}
        sitekey={import.meta.env.VITE_RECAPTCHA_KEY}
        size="invisible"
        onExpired={onExpired}
      />
    ),
    getRecaptchaValue: async () => {
      if (value.current) {
        rc.current?.reset();
        value.current = null;
      }
      value.current = await Promise.race([
        rc.current?.executeAsync(),
        // Таймаут 10 секунд, возвращает пустую строку
        new Promise<string>((res) => setTimeout(() => res(''), 10000))
      ]);
      return value.current!;
    }
  };
}

export default useInvisibleRecaptcha;
