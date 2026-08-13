import React, { useState } from 'react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSubmitLogin: (dto: { username: string; password: string }) => Promise<any>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSubmitLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmitLogin({ username, password });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Log In to WordStreak</h2>
      {error && <div className="error-message" role="alert">{error}</div>}
      <div className="form-group">
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};
