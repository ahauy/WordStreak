import React, { useState } from 'react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSubmitRegister: (dto: { username: string; password: string }) => Promise<any>;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSubmitRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3 || username.length > 30) {
      setError('Username must be between 3 and 30 characters long');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }
    if (password.length < 8 || password.length > 72) {
      setError('Password must be between 8 and 72 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRegister({ username, password });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Create WordStreak Account</h2>
      {error && <div className="error-message" role="alert">{error}</div>}
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};
