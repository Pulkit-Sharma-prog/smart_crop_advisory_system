import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { diseaseCatalogSeed } from "./diseaseCatalog.js";
import { backendEnv } from "./env.js";

const INITIAL_DB = {
  meta: {
    version: 1,
    createdAt: new Date().toISOString(),
  },
  diseaseProfiles: [],
  diagnoses: [],
};

function ensureDirectory(filePath) {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return structuredClone(INITIAL_DB);
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return structuredClone(INITIAL_DB);
  }
}

function writeJsonAtomic(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}

class EmbeddedDb {
  constructor(filePath) {
    this.filePath = filePath;
    ensureDirectory(this.filePath);
    this.state = readJson(this.filePath);
    this.seedDiseaseProfiles();
    this.flush();
  }

  flush() {
    writeJsonAtomic(this.filePath, this.state);
  }

  seedDiseaseProfiles() {
    const byId = new Map(this.state.diseaseProfiles.map((entry) => [entry.id, entry]));
    diseaseCatalogSeed.forEach((profile) => {
      byId.set(profile.id, profile);
    });
    this.state.diseaseProfiles = Array.from(byId.values());
  }

  getDiseaseProfileByName(name) {
    const normalized = name.trim().toLowerCase();
    const exact = this.state.diseaseProfiles.find((entry) => entry.displayName.toLowerCase() === normalized);
    if (exact) return exact;

    return (
      this.state.diseaseProfiles.find((entry) => normalized.includes(entry.displayName.toLowerCase()))
      ?? this.state.diseaseProfiles.find((entry) => entry.displayName.toLowerCase().includes(normalized))
      ?? null
    );
  }

  insertDiagnosis(record) {
    this.state.diagnoses.push(record);
    const maxRows = 5000;
    if (this.state.diagnoses.length > maxRows) {
      this.state.diagnoses = this.state.diagnoses.slice(this.state.diagnoses.length - maxRows);
    }
    this.flush();
  }

  listRecentDiagnoses(limit = 20) {
    return this.state.diagnoses.slice(-limit).reverse();
  }
}

let dbInstance;

export function getDatabase() {
  if (!dbInstance) {
    const currentFile = fileURLToPath(import.meta.url);
    const backendRoot = path.resolve(path.dirname(currentFile), "..");
    const resolved = path.isAbsolute(backendEnv.embeddedDbPath)
      ? backendEnv.embeddedDbPath
      : path.resolve(backendRoot, backendEnv.embeddedDbPath);
    dbInstance = new EmbeddedDb(resolved);
  }

  return dbInstance;
}
