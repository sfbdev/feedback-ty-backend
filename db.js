import sqlite3 from 'sqlite3'
import {open} from 'sqlite'

export default new class {
  constructor() {
    this.db = null;
  }

  async open() {
    if (this.db !== null) {
      return this.db;
    }

    this.db = await open({
      filename: 'feedback.db',
      driver: sqlite3.Database,
    });
  }

  async createTablesIfNotExists() {
    await this.db.exec(`
        CREATE TABLE IF NOT EXISTS users
        (
            id       INTEGER PRIMARY KEY,
            clientId TEXT NOT NULL,
            email TEXT NOT NULL,
            "password" TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS feedbacks
        (
            id       INTEGER PRIMARY KEY,
            "text"   TEXT NOT NULL,
            clientId TEXT NOT NULL
        );
    `)
  }

  async saveFeedback(clientId, text) {
    const sql = "INSERT INTO feedbacks (clientId, text) VALUES (?, ?)"

    return await this.db.run(sql, [clientId, text])
  }

  async saveUser(email, passwod, clientId) {
    const sql = "INSERT INTO users (email, `password`, clientId) VALUES (?, ?, ?)"

    return await this.db.run(sql, [email, passwod, clientId])
  }

  async getUserByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?;"

    return await this.db.get(sql, [email]);
  }

  async getAllFeedbacks(clientId) {
    const sql = "SELECT id, text FROM feedbacks WHERE clientId = ? ORDER BY id DESC"

    return await this.db.all(sql, [clientId]);
  }

  async getUserByClientId(clientId) {
    const sql = "SELECT * FROM users WHERE clientId = ?;"

    return await this.db.get(sql, [clientId]);
  }
}