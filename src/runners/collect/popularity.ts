import { nasdaqRatingUtil } from './../../nasdaq-rating/nasdaq-rating.util';
import { popularityUtil } from './../../popularity/popularity.util';

async function run() {
  await popularityUtil.download();
  await nasdaqRatingUtil.download();
}
run();
