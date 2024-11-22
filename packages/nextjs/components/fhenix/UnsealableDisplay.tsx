"use client";

import { processUnsealables, Unsealable, Unsealed, UnsealedArray } from "fhenix-utils/encryption/types";
import React from "react";

type UnsealableDisplayBaseProps = {
  nullish?: boolean;
  className?: string;
  sealedClassName?: string;
  sealedLength?: number;
};

export const UnsealableDisplay = <T,>({
  item,
  fn = val => `${val}`,
  nullish = false,
  className = "",
  sealedClassName = "relative",
  sealedLength = 5,
}: {
  item: Unsealable<T> | T | undefined;
  fn?: (item: NonNullable<T> | Unsealed<T>) => string;
} & UnsealableDisplayBaseProps) => {
  const isNullish = nullish || item == null;
  const unsealable = processUnsealables([item], fn);
  return (
    <span className={[className, unsealable == null || unsealable.unsealed ? "" : sealedClassName].join(" ")}>
      {isNullish ? ".".repeat(sealedLength) : !unsealable.unsealed ? "*".repeat(sealedLength) : unsealable.data}
    </span>
  );
};

export const UnsealablesDisplay = <T extends any[]>({
  items,
  fn,
  ...props
}: {
  items: [...T];
  fn: (...args: UnsealedArray<[...T]>) => string;
} & UnsealableDisplayBaseProps) => {
  const anyNullish = props.nullish || items.some(item => item == null);
  const unsealable = processUnsealables(items, fn);
  return <UnsealableDisplay item={anyNullish ? undefined : unsealable} {...props} />;
};
