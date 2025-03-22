import type { InfrastructureModel, ValidationIssue } from "../domain/infrastructure/types";

export interface ImportResult {
  ok: boolean;
  model?: InfrastructureModel;
  issues: ValidationIssue[];
  message?: string;
}

export interface ArchitectureImporter {
  readonly format: string;
  importSource(source: string): ImportResult;
}
