import { dateUtil } from '../../util/date.util';
import { StockPickerUtil } from '../../predictions/stock-picker/stock-picker.util';

async function run() {
  await StockPickerUtil.pickStocksForDate(dateUtil.today);
}
run();
