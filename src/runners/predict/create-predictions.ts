import { dateUtil } from '../../util/date.util';
import { predictionUtil } from '../../predictions/prediction.util';

export async function run() {
  await predictionUtil.createPredictions(dateUtil.today);
}
run().catch(e => {
  console.error(e);
  process.exit(1);
});
