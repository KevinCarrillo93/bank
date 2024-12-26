import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { register, handleSubmit, setError, watch, formState: { errors } } = useForm();
  const password = watch('password', ''); // Para la validación de confirmación de contraseña
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result)

      if (response.ok) {
        // Si la respuesta es exitosa (HTTP 200 o similar)
        if (result.id) { 
          navigate("/login"); // Redirige a una página de éxito
        } else {
          console.error("Respuesta inesperada:", result);
        }
      } else {
        // Si hay errores de validación o del backend
        if (result.errors) {
          result.errors.forEach((error) => {
            setError(error.field, { type: "server", message: error.message });
          });
        } else {
          setError("general", { type: "server", message: "Error desconocido" });
        }
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setError("general", { type: "server", message: "Error de conexión al servidor" });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', { required: 'Email is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            {...register('password', { required: 'Password is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', { 
              required: 'Confirm Password is required', 
              validate: (value) => value === password || 'Passwords do not match' 
            })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">Register</button>
      </form>
    </div>
  );
};

export default Register;
