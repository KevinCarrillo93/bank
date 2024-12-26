import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const FinancialSimulator = () => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const [simulations, setSimulations] = useState([]);
  const [interestRate, setInterestRate] = useState(0);
  const watchDates = watch(["startDate", "endDate"]);
  const navigate = useNavigate();

  useEffect(() => {
    const [startDate, endDate] = watchDates;
    if (startDate && endDate) {
      const startYear = new Date(startDate).getFullYear();
      const endYear = new Date(endDate).getFullYear();
      setInterestRate(startYear === endYear ? 5 : 7);
    }
  }, [watchDates]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        alert("Logged out successfully");
        navigate("/login");
      } else {
        alert("Failed to log out");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("An error occurred while logging out");
    }
  };

  const onSubmit = (data) => {
    const simulation = { ...data, interestRate, id: Date.now() };
    setSimulations((prev) => [...prev, simulation]);
    reset();
  };

  const deleteSimulation = (id) => {
    setSimulations((prev) => prev.filter((sim) => sim.id !== id));
  };

  const editSimulation = (id) => {
    const simulation = simulations.find((sim) => sim.id === id);
    if (simulation) {
      setValue("amount", simulation.amount);
      setValue("paymentTerm", simulation.paymentTerm);
      setValue("startDate", simulation.startDate);
      setValue("endDate", simulation.endDate);
      deleteSimulation(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Simulador Financiero</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded shadow-md mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="amount">
            Monto
          </label>
          <input
            id="amount"
            type="number"
            {...register("amount", { required: "El monto es obligatorio", min: 1 })}
            className={`w-full px-4 py-2 border rounded ${
              errors.amount ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ingrese el monto a invertir"
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="paymentTerm">
            Término de pago
          </label>
          <select
            id="paymentTerm"
            {...register("paymentTerm", { required: "Debe seleccionar un término de pago" })}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Seleccione</option>
            <option value="Mensual">Mensual</option>
            <option value="Anual">Anual</option>
          </select>
          {errors.paymentTerm && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentTerm.message}</p>
          )}
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2" htmlFor="startDate">
              Fecha de inicio
            </label>
            <input
              id="startDate"
              type="date"
              {...register("startDate", { required: "La fecha de inicio es obligatoria" })}
              className="w-full px-4 py-2 border rounded"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2" htmlFor="endDate">
              Fecha de fin
            </label>
            <input
              id="endDate"
              type="date"
              {...register("endDate", { required: "La fecha de fin es obligatoria" })}
              className="w-full px-4 py-2 border rounded"
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 font-bold">
            Tasa de interés: <span className="text-blue-600">{interestRate}%</span>
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
        >
          Guardar simulación
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4">Simulaciones realizadas</h2>
      <table className="w-full bg-white rounded shadow-md text-sm sm:text-base">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="py-2 px-2 sm:px-4">Monto</th>
            <th className="py-2 px-2 sm:px-4">Término</th>
            <th className="py-2 px-2 sm:px-4">Inicio</th>
            <th className="py-2 px-2 sm:px-4">Fin</th>
            <th className="py-2 px-2 sm:px-4">Tasa (%)</th>
            <th className="py-2 px-2 sm:px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {simulations.map((sim) => (
            <tr key={sim.id} className="border-t">
              <td className="py-2 px-2 sm:px-4">{sim.amount}</td>
              <td className="py-2 px-2 sm:px-4">{sim.paymentTerm}</td>
              <td className="py-2 px-2 sm:px-4">{sim.startDate}</td>
              <td className="py-2 px-2 sm:px-4">{sim.endDate}</td>
              <td className="py-2 px-2 sm:px-4">{sim.interestRate}</td>
              <td className="py-2 px-2 sm:px-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => editSimulation(sim.id)}
                  className="text-blue-500 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteSimulation(sim.id)}
                  className="text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-center sm:justify-end">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full sm:w-auto"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default FinancialSimulator;
