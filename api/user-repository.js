import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import {
  SALT_ROUNDS,
  DB_HOST,
  DB_USER,
  DB_PORT,
  DB_PASSWORD,
  DB_NAME,
} from "./config.js";
import { ValidationError } from "./errors.js";
import crypto from "crypto";

const config = {
  host: DB_HOST,
  user: DB_USER,
  port: DB_PORT,
  password: DB_PASSWORD,
  database: DB_NAME,
};
const connection = await mysql.createConnection(config);
connection
  .connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Database connection error:", err));

export class UserRepository {
  static async create({ email, password }) {
    // Validar email y contraseña
    Validation.email(email);
    Validation.password(password);

    // Comprobar si el usuario ya existe
    const [rows] = await connection.execute(
      "SELECT * FROM Usuario WHERE email = ?",
      [email]
    );
    if (rows.length > 0) {
      throw new ValidationError("Email already exists!");
    }

    // Crear un nuevo usuario
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await connection.execute(
      "INSERT INTO Usuario (id, email, password) VALUES (UUID_TO_BIN(?), ?, ?)",
      [id, email, hashedPassword]
    );

    return id;
  }

  static async login({ email, password }) {
    // Validar email y contraseña
    Validation.email(email);
    Validation.password(password);

    // Buscar el usuario en la base de datos
    const [rows] = await connection.execute(
      "SELECT BIN_TO_UUID(id) as id, email, password FROM Usuario WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      throw new ValidationError("Email does not exist");
    }

    const user = rows[0];

    // Verificar la contraseña
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new ValidationError("Password is invalid");
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  static async saveSimulation({ userId, monto, terminoPago, fechaInicio, fechaFin, tasaInteres }) {
    if (!userId || !monto || !terminoPago || !fechaInicio || !fechaFin || !tasaInteres) {
      throw new ValidationError("All fields are required");
    }
    const [result] = await connection.execute(
      "INSERT INTO Simulacion (monto, termino_pago, fecha_inicio, fecha_fin, tasa, usuario_id) VALUES (?, ?, ?, ?, ?, UUID_TO_BIN(?))",
      [monto, terminoPago, fechaInicio, fechaFin, tasaInteres, userId]
    );

    return result.insertId;  // Devuelve el ID de la simulación insertada
  }

  static async getSimulations(userId) {
    const [rows] = await connection.execute(
        "SELECT id, monto, termino_pago, fecha_inicio, fecha_fin, tasa, created_at FROM Simulacion WHERE usuario_id = UUID_TO_BIN(?)",
        [userId]
    );
    return rows;
  }

  static async getSimulationById(simulationId, userId) {
    const [rows] = await connection.execute(
        "SELECT id, monto, termino_pago, fecha_inicio, fecha_fin, tasa, created_at FROM Simulacion WHERE id = ? AND usuario_id = UUID_TO_BIN(?)",
        [simulationId, userId]
    );

    if (rows.length === 0) {
        throw new ValidationError("Simulation not found");
    }

    return rows[0];
  }

  static async updateSimulation({ simulationId, userId, monto, terminoPago, fechaInicio, fechaFin, tasaInteres }) {
    if (!monto || !terminoPago || !fechaInicio || !fechaFin || !tasaInteres) {
        throw new ValidationError("All fields are required");
    }

    const [result] = await connection.execute(
        "UPDATE Simulacion SET monto = ?, termino_pago = ?, fecha_inicio = ?, fecha_fin = ?, tasa = ? WHERE id = ? AND usuario_id = UUID_TO_BIN(?)",
        [monto, terminoPago, fechaInicio, fechaFin, tasaInteres, simulationId, userId]
    );

    if (result.affectedRows === 0) {
        throw new ValidationError("Simulation update failed or does not exist");
    }

    return result;
  }
  static async deleteSimulation(simulationId, userId) {
    const [result] = await connection.execute(
        "DELETE FROM Simulacion WHERE id = ? AND usuario_id = UUID_TO_BIN(?)",
        [simulationId, userId]
    );

    if (result.affectedRows === 0) {
        throw new ValidationError("Simulation delete failed or does not exist");
    }

    return { success: true };
  }

}

class Validation {
  static email(email) {
    if (!email) throw new ValidationError("Email is required");
    if (email.length < 3)
      throw new ValidationError("Email must be at least 3 characters long");
  }

  static password(password) {
    if (!password) throw new ValidationError("Password is required");
    if (typeof password !== "string")
      throw new ValidationError("Password must be a string");
    if (password.length < 6)
      throw new ValidationError("Password must be at least 6 characters long");
  }
}
