import type { EntityId } from '../../brp/brp-0.20';

export function entityIdToStringV16(entityId: EntityId): string {
  // FIXME: Entity IDs should already be in bigint form.
  const bits = BigInt(entityId);
  const index = bits & 0xffffffffn;
  const generation = (bits >> 32n) & 0xffffffffn;
  return `${index}v${generation}`;
}

export function entityIdToStringV17(entityId: EntityId): string {
  // FIXME: Entity IDs should already be in bigint form.
  const bits = BigInt(entityId);
  const index = ~(bits & 0xffffffffn) & 0xffffffffn;
  const generation = (bits >> 32n) & 0xffffffffn;
  return `${index}v${generation}`;
}
