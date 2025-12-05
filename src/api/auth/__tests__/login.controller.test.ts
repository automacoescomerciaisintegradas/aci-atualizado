import { describe, it, expect } from 'vitest';
import { googleLoginSchema } from './login.controller';

describe('googleLoginSchema', () => {
  it('should invalidate when both idToken and accessToken are provided', () => {
    const result = googleLoginSchema.safeParse({
      idToken: 'some-id-token',
      accessToken: 'some-access-token',
    });
    expect(result.success).toBe(false);
  });
});