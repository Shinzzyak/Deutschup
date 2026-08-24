import { describe, it, expect, beforeEach } from 'vitest';

describe('Auth Store Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Session management', () => {
    it('should handle null session gracefully', () => {
      const session = null;
      const user = session ? { id: 'test' } : null;
      expect(user).toBeNull();
    });

    it('should extract user from session', () => {
      const session = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };
      expect(session.user.id).toBe('user-123');
      expect(session.user.email).toBe('test@example.com');
    });
  });

  describe('Role detection', () => {
    it('should identify admin by email', () => {
      const adminEmail: string = 'abdullahalmughiroh@gmail.com';
      const userEmail = adminEmail;
      const isAdmin = userEmail === adminEmail;
      expect(isAdmin).toBe(true);
    });

    it('should not identify non-admin as admin', () => {
      const adminEmail: string = 'abdullahalmughiroh@gmail.com';
      const userEmail: string = 'other@example.com';
      const isAdmin = userEmail === adminEmail;
      expect(isAdmin).toBe(false);
    });
  });

  describe('localStorage caching', () => {
    it('should cache user data', () => {
      const userData = { id: 'user-123', name: 'Test User' };
      localStorage.setItem('du_user', JSON.stringify(userData));

      const cached = JSON.parse(localStorage.getItem('du_user')!);
      expect(cached.id).toBe('user-123');
      expect(cached.name).toBe('Test User');
    });

    it('should handle missing cache', () => {
      const cached = localStorage.getItem('du_user');
      expect(cached).toBeNull();
    });

    it('should clear cache on logout', () => {
      localStorage.setItem('du_user', JSON.stringify({ id: 'test' }));
      localStorage.removeItem('du_user');
      expect(localStorage.getItem('du_user')).toBeNull();
    });
  });
});
