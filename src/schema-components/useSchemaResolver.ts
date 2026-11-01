import $RefParser from '@apidevtools/json-schema-ref-parser';
import type { BevyRootJsonSchema, TypedValue } from '../inspector-data/types';
import { useEffect, useMemo, useState } from 'react';

//$RefParser depends on the node only Buffer api (not to be confused with ArrayBuffer), and must be polyfilled in webviews
import { Buffer as BufferPolyfill } from 'buffer';
(globalThis as Record<string, unknown>).Buffer = BufferPolyfill;

async function dereferenceSchema(schema: BevyRootJsonSchema): Promise<BevyRootJsonSchema> {
  return await $RefParser.dereference<BevyRootJsonSchema>(schema, {
    dereference: { preservedProperties: ['typePath', 'shortPath'] },
  });
}

type Resolver = (def: TypedValue) => TypedValue;

export function useSchemaResolver(schema: BevyRootJsonSchema | undefined): Resolver | undefined {
  const dereferencedSchemaPromise = useMemo<Promise<BevyRootJsonSchema | undefined>>(
    () => (schema ? dereferenceSchema(schema) : Promise.resolve(undefined)),
    [schema],
  );
  const [dereferencedSchema, setDereferencedSchema] = useState<BevyRootJsonSchema>();
  useEffect(() => {
    let reject: (reason?: unknown) => void;
    const cancellation = new Promise<never>((_res, rej) => {
      reject = rej;
    });
    Promise.race([dereferencedSchemaPromise, cancellation]).then((val) => setDereferencedSchema(val));
    return () => {
      reject('Cancelled');
      setDereferencedSchema(undefined);
    };
  });
  return (def: TypedValue) => ({
    ...def,
    schema: dereferencedSchema?.$defs[def.schema.typePath] ?? def.schema,
  });
}
