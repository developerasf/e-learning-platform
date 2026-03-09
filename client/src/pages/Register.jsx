import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/register-otp');
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center">
        <p className="text-gray-700 dark:text-gray-300">Redirecting to registration...</p>
        <Link to="/register-otp" className="text-blue-600 dark:text-blue-400 hover:underline">
          Click here if not redirected
        </Link>
      </div>
    </div>
  );
};

export default Register;
