import { zachsUtil } from '../../zachs/zachs.util';
//import { nasdaqRatingUtil } from './../../nasdaq-rating/nasdaq-rating.util';
import { popularityUtil } from './../../popularity/popularity.util';

async function run() {
  await Promise.all([
    popularityUtil.download(),
    zachsUtil.download()
  ]);
}
run();
