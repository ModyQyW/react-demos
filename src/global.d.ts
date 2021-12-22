declare global {
  type TOption<T = any, V = T> = {
    label: T;
    value: V;
  };
}

export {};
