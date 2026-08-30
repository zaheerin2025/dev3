import type { ToolDefinition, ToolMeta } from '@/data/tools/types';
import { batch as batchGenerators } from './batches/generators';
import { batch as batchText } from './batches/text-tools';
import { batch as batchCalc } from './batches/calculators';
import { batch as batchImage } from './batches/image-visual';
import { batch as batchDev } from './batches/dev-url';
import { toolRegistry } from '@/data/tools/registry';

/** Component + page copy contributed by batch files, keyed by slug. */
const implementations = new Map<string, { Component: React.ComponentType; doc: ToolDefinition['doc'] }>();
for (const entry of [...batchGenerators, ...batchText, ...batchCalc, ...batchImage, ...batchDev]) {
  if (!implementations.has(entry.slug)) {
    implementations.set(entry.slug, { Component: entry.Component, doc: entry.doc });
  }
}

/** Full definitions: registry metadata merged with batch implementations. */
export const toolDefinitions: ToolDefinition[] = toolRegistry
  .filter((meta) => implementations.has(meta.slug))
  .map((meta) => ({
    meta,
    Component: implementations.get(meta.slug)!.Component,
    doc: implementations.get(meta.slug)!.doc,
  }));

const bySlug = new Map(toolDefinitions.map((d) => [d.meta.slug, d]));

export function getToolDefinition(slug: string): ToolDefinition | null {
  return bySlug.get(slug) ?? null;
}

export function getDefinitionsByMeta(metas: ToolMeta[]): ToolDefinition[] {
  return metas
    .map((m) => bySlug.get(m.slug))
    .filter((d): d is ToolDefinition => Boolean(d));
}
