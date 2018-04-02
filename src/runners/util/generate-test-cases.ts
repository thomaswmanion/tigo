export async function run() {
  for (let i = 0; i < 200; i++) {
    const size = getValInRange(3,10);
    const longMapSteps = getValInRange(size, 35);
    const minIndustryMedian = Math.random() > 0.5 ? 0 : -1;
    const divideResultByIncrease = Math.random() > 0.5 ? 1 : 0;
    console.log(`--size=${size} --longMapSteps=${longMapSteps} --minIndustryMedian=${minIndustryMedian} --divideResultByIncrease=${divideResultByIncrease}`);
  }
}
run();

function getValInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
