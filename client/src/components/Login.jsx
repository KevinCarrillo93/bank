import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const result = await response.json();
        // Manejar errores desde el backend
        if (result.error === 'ValidationError') {
          setError('email', { type: 'manual', message: result.message });
        } else {
          alert('Error: Something went wrong. Please try again.');
        }
        return;
      }

      // Login exitoso
      console.log('Login exitoso');
      navigate('/protected'); // Redirigir a la página del simulador
    } catch (error) {
      console.error('Error de red:', error.message);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
        
        {/* Campo Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            {...register('email', { required: 'Este campo es obligatorio' })}
            className="mt-1 p-2 w-full border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        
        {/* Campo Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            {...register('password', { required: 'Este campo es obligatorio' })}
            className="mt-1 p-2 w-full border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4"
        >
          Iniciar Sesión
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')} // Redirigir al componente de registro
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Crear Cuenta
        </button>
      </form>
    </div>
  );
};

export default Login;
