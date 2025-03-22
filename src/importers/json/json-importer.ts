import {
  formatValidationIssues,
  validateInfrastructureModel,
} from "../../domain/infrastructure/architecture";
import type { ArchitectureImporter, ImportResult } from "../types";

export class JsonArchitectureImporter implements ArchitectureImporter {
  readonly format = "json";

  importSource(source: string): ImportResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(source);
    } catch {
      return {
        ok: false,
        issues: [{ path: "", message: "Unable to import architecture. The file is not valid JSON." }],
        message: "Unable to import architecture. The file is not valid JSON.",
      };
    }

    const validation = validateInfrastructureModel(parsed);
    if (!validation.ok) {
      return {
        ok: false,
        issues: validation.issues,
        message: `Unable to import architecture.\n${formatValidationIssues(validation.issues)}`,
      };
    }

    return {
      ok: true,
      model: validation.value,
      issues: [],
    };
  }
}

export const jsonArchitectureImporter = new JsonArchitectureImporter();
