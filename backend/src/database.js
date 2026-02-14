import { diseaseCatalogSeed } from "./diseaseCatalog.js";
import { backendEnv } from "./env.js";

const JSON_COLUMNS = [
  "symptoms",
  "preventive_measures",
  "curative_actions",
  "organic_options",
  "primary_visible_symptoms",
  "alternatives",
  "sources",
  "symptom_matches",
  "provider_errors",
];

function parseJsonColumns(row) {
  if (!row) return null;
  const parsed = { ...row };
  JSON_COLUMNS.forEach((column) => {
    if (typeof parsed[column] === "string") {
      try {
        parsed[column] = JSON.parse(parsed[column]);
      } catch {
        parsed[column] = [];
      }
    }
  });
  return parsed;
}

class MySqlDatabase {
  constructor(pool) {
    this.pool = pool;
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS disease_profiles (
        id VARCHAR(80) PRIMARY KEY,
        display_name VARCHAR(150) NOT NULL,
        crop VARCHAR(120) NOT NULL,
        symptoms JSON NOT NULL,
        preventive_measures JSON NOT NULL,
        curative_actions JSON NOT NULL,
        organic_options JSON NOT NULL,
        escalation_advice TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS diagnoses (
        diagnosis_id VARCHAR(64) PRIMARY KEY,
        recorded_at DATETIME NOT NULL,
        crop_hint VARCHAR(120) NULL,
        file_name VARCHAR(255) NOT NULL,
        primary_name VARCHAR(150) NOT NULL,
        primary_confidence INT NOT NULL,
        primary_visible_symptoms JSON NOT NULL,
        alternatives JSON NOT NULL,
        analysis_summary TEXT NOT NULL,
        severity VARCHAR(20) NOT NULL,
        confidence_note TEXT NOT NULL,
        preventive_measures JSON NOT NULL,
        curative_actions JSON NOT NULL,
        organic_options JSON NOT NULL,
        escalation_advice TEXT NOT NULL,
        sources JSON NOT NULL,
        symptom_matches JSON NOT NULL,
        provider_errors JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.seedDiseaseProfiles();
  }

  async seedDiseaseProfiles() {
    for (const profile of diseaseCatalogSeed) {
      await this.pool.execute(
        `
          INSERT INTO disease_profiles (
            id, display_name, crop, symptoms, preventive_measures,
            curative_actions, organic_options, escalation_advice
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            display_name = VALUES(display_name),
            crop = VALUES(crop),
            symptoms = VALUES(symptoms),
            preventive_measures = VALUES(preventive_measures),
            curative_actions = VALUES(curative_actions),
            organic_options = VALUES(organic_options),
            escalation_advice = VALUES(escalation_advice)
        `,
        [
          profile.id,
          profile.displayName,
          profile.crop,
          JSON.stringify(profile.symptoms),
          JSON.stringify(profile.preventiveMeasures),
          JSON.stringify(profile.curativeActions),
          JSON.stringify(profile.organicOptions),
          profile.escalationAdvice,
        ],
      );
    }
  }

  async getDiseaseProfileByName(name) {
    const normalized = name.trim().toLowerCase();

    const [exactRows] = await this.pool.execute(
      `SELECT * FROM disease_profiles WHERE LOWER(display_name) = ? LIMIT 1`,
      [normalized],
    );
    const exact = parseJsonColumns(exactRows[0]);
    if (exact) {
      return {
        id: exact.id,
        displayName: exact.display_name,
        crop: exact.crop,
        symptoms: exact.symptoms ?? [],
        preventiveMeasures: exact.preventive_measures ?? [],
        curativeActions: exact.curative_actions ?? [],
        organicOptions: exact.organic_options ?? [],
        escalationAdvice: exact.escalation_advice,
      };
    }

    const [fuzzyRows] = await this.pool.execute(
      `
        SELECT *
        FROM disease_profiles
        WHERE ? LIKE CONCAT('%', LOWER(display_name), '%')
          OR LOWER(display_name) LIKE CONCAT('%', ?, '%')
        LIMIT 1
      `,
      [normalized, normalized],
    );
    const fuzzy = parseJsonColumns(fuzzyRows[0]);
    if (!fuzzy) return null;

    return {
      id: fuzzy.id,
      displayName: fuzzy.display_name,
      crop: fuzzy.crop,
      symptoms: fuzzy.symptoms ?? [],
      preventiveMeasures: fuzzy.preventive_measures ?? [],
      curativeActions: fuzzy.curative_actions ?? [],
      organicOptions: fuzzy.organic_options ?? [],
      escalationAdvice: fuzzy.escalation_advice,
    };
  }

  async insertDiagnosis(record) {
    await this.pool.execute(
      `
        INSERT INTO diagnoses (
          diagnosis_id, recorded_at, crop_hint, file_name, primary_name, primary_confidence,
          primary_visible_symptoms, alternatives, analysis_summary, severity, confidence_note,
          preventive_measures, curative_actions, organic_options, escalation_advice,
          sources, symptom_matches, provider_errors
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        record.diagnosisId,
        new Date(record.recordedAt),
        record.cropHint,
        record.fileName,
        record.primary.name,
        record.primary.confidence,
        JSON.stringify(record.primary.visibleSymptoms ?? []),
        JSON.stringify(record.alternatives ?? []),
        record.analysisSummary,
        record.severity,
        record.confidenceNote,
        JSON.stringify(record.guidance.preventiveMeasures ?? []),
        JSON.stringify(record.guidance.curativeActions ?? []),
        JSON.stringify(record.guidance.organicOptions ?? []),
        record.guidance.escalationAdvice,
        JSON.stringify(record.sources ?? []),
        JSON.stringify(record.symptoms ?? []),
        JSON.stringify(record.providerErrors ?? []),
      ],
    );
  }

  async listRecentDiagnoses(limit = 20) {
    const [rows] = await this.pool.execute(
      `SELECT * FROM diagnoses ORDER BY recorded_at DESC LIMIT ?`,
      [Math.max(1, Math.min(100, limit))],
    );
    return rows.map((entry) => parseJsonColumns(entry));
  }
}

async function createDatabase() {
  let mysql;
  try {
    mysql = await import("mysql2/promise");
  } catch {
    throw new Error("MySQL driver missing. Run: npm --prefix backend install mysql2");
  }

  const pool = backendEnv.mysqlUrl
    ? mysql.createPool({
        uri: backendEnv.mysqlUrl,
        waitForConnections: true,
        connectionLimit: backendEnv.mysqlPoolLimit,
      })
    : mysql.createPool({
        host: backendEnv.mysqlHost,
        port: backendEnv.mysqlPort,
        user: backendEnv.mysqlUser,
        password: backendEnv.mysqlPassword,
        database: backendEnv.mysqlDatabase,
        waitForConnections: true,
        connectionLimit: backendEnv.mysqlPoolLimit,
      });

  const database = new MySqlDatabase(pool);
  await database.init();
  return database;
}

let databasePromise;

export function getDatabase() {
  if (!databasePromise) {
    databasePromise = createDatabase();
  }
  return databasePromise;
}
