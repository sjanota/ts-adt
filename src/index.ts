type RawCase<Data, Key> = Readonly<Data> & { _type: Key };

type SelectedRawCases<
  Schema,
  Keys extends keyof Schema = keyof Schema
> = Keys extends keyof Schema ? RawCase<Schema[Keys], Keys> : never;

type RawCaseConstructor<Data, Key> = ((t: Data) => RawCase<Data, Key>) & {
  type: Key;
};

type CaseConstructorForKey<Data> = <Key>(
  k: Key
) => RawCaseConstructor<Data, Key>;

type MatchPattern<Schema, Keys extends keyof Schema, Out> = {
  [k in Keys]: (v: RawCase<Schema[k], k>) => Out;
};

export type ADT<Def> = Def extends Definition<infer O>
  ? SelectedRawCases<O>
  : never;

export type Case<ADT, Case> = ADT extends SelectedRawCases<infer O, infer K>
  ? string
  : never;

type RawCaseConstructors<Schema> = {
  [k in keyof Schema]: RawCaseConstructor<Schema[k], k>;
};

type Utilities<Schema> = {
  match<Keys extends keyof Schema, Out>(
    adt: SelectedRawCases<Schema, Keys>,
    pattern: MatchPattern<Schema, Keys, Out>
  ): Out;
  allCasesCovered(x: never): never;
  isCase<K extends keyof Schema>(
    adt: SelectedRawCases<Schema>,
    ...keys: K[]
  ): adt is SelectedRawCases<Schema, K>;
};

type Definition<Schema> = Utilities<Schema> & {
  cases: RawCaseConstructors<Schema>;
};

type ConstructorsObject<Schema> = {
  [key in keyof Schema]: CaseConstructorForKey<Schema[key]>;
};

function match<Schema, Keys extends keyof Schema, Out>(
  adt: SelectedRawCases<Schema, Keys>,
  pattern: MatchPattern<Schema, Keys, Out>
): Out {
  return pattern[adt._type as Keys](adt);
}

function allCasesCovered(x: never): never {
  throw new Error(`Unexpected case ${x}`);
}

function isCase<Schema, K extends keyof Schema>(
  adt: SelectedRawCases<Schema>,
  ...keys: K[]
): adt is SelectedRawCases<Schema, K> {
  return keys.some((k) => adt._type === k);
}

export function Cases<Schema>(
  t: ConstructorsObject<Schema>
): Definition<Schema> {
  const cons: RawCaseConstructors<Schema> = Object.keys(t).reduce<
    Partial<RawCaseConstructors<Schema>>
  >((acc, k) => {
    return Object.assign(acc, { [k]: t[k as keyof Schema](k) });
  }, {}) as RawCaseConstructors<Schema>;

  return {
    cases: cons,
    match,
    allCasesCovered,
    isCase,
  };
}

export function Case<Data>(): CaseConstructorForKey<Data> {
  return <Key>(k: Key) =>
    Object.assign((data: Data) => ({ ...data, _type: k }), { type: k });
}
