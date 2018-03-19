import { dateUtil } from './../../util/date.util';
import { fileUtil } from './../../util/file.util';
import * as fs from 'fs-extra';

export async function run() {
  const snaps = await fileUtil.ls('price-snapshots');
  for (const snap of snaps) {
    const oldDate = new Date(snap.replace('.csv', '').replace(/-/g, '/'));
    const day = oldDate.getDay();
    if (day === 0) {
      const newDate = new Date(+oldDate - dateUtil.oneDay - dateUtil.oneDay);
      console.log(snap, oldDate, newDate);
      const newSnap = dateUtil.formatDate(newDate) + '.csv';
      try {
        const src = '/Users/thomas.w.manion/tempest/price-snapshots/' + snap;
        const dest = '/Users/thomas.w.manion/tempest/price-snapshots/' + newSnap;
        // console.log(src, dest);
        await fs.copy(src, dest);
      } catch (e) {
        console.log(e.message);
      }

    }
  }
}
run();
