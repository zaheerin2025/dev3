import type { ToolDoc } from '@/data/tools/types';

/**
 * A batch entry: the interactive component + unique page copy for one tool.
 * The slug MUST match src/data/tools/registry.ts exactly.
 */
export interface BatchTool {
  slug: string;
  Component: React.ComponentType;
  doc: ToolDoc;
}
