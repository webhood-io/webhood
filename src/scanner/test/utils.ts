function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export const randomSlug = () =>
  `test-${randomIntFromInterval(1, 10000).toString()}`;
