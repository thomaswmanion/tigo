import { popularityUtil } from './../../popularity/popularity.util';

async function run() {
  await popularityUtil.download();
}
run();
