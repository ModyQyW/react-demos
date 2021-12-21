export * from '@modyqyw/utils';

export const randomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;
