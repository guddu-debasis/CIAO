import { useState } from 'react';
import axios from 'axios';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const { data } = await axios.post('/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.user, data.token);
            } else {
                await axios.post('/api/auth/signup', formData);
                setIsLogin(true); // Switch to login after signup
                setError('Signup successful! Please login.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box glass">
                <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

                {error && <div style={{ color: '#f87171', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="form-group">
                    {!isLogin && (
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
                </form>

                <div className="switch-auth">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Auth;
