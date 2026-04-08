// ENUMS mapped internally to replace PostgreSQL enums for our SQLite Database

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED"
}

export enum CaseStatus {
  SUFFERING = "SUFFERING",
  HELPING = "HELPING",
  RESOLVED = "RESOLVED"
}

export enum CaseCategory {
  MEDICAL = "MEDICAL",
  EDUCATION = "EDUCATION",
  FOOD = "FOOD",
  SHELTER = "SHELTER",
  TRANSPORTATION = "TRANSPORTATION",
  WATER = "WATER",
  OTHER = "OTHER"
}

export enum Urgency {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}
