type SerializableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SerializableValue[]
  | { [key: string]: SerializableValue };

function serializeValue(value: unknown): SerializableValue {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue) as SerializableValue[];
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const result: Record<string, SerializableValue> = {};

    for (const [key, nestedValue] of Object.entries(record)) {
      if (key === 'id' && typeof nestedValue === 'string') {
        result._id = nestedValue;
        continue;
      }

      if (
        typeof nestedValue === 'object' &&
        nestedValue !== null &&
        !(nestedValue instanceof Date) &&
        !Array.isArray(nestedValue)
      ) {
        result[key] = serializeDoc(nestedValue);
        continue;
      }

      result[key] = serializeValue(nestedValue);
    }

    return result;
  }

  return value as SerializableValue;
}

export function serializeDoc<T>(entity: T): T & { _id: string } {
  return serializeValue(entity) as T & { _id: string };
}

export function serializeDocs<T>(entities: T[]): Array<T & { _id: string }> {
  return entities.map((entity) => serializeDoc(entity));
}
