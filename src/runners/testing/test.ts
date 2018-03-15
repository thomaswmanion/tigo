import { Robinhood } from "../../robinhood/robinhood.api";

export async function run() {
  const fundamentals = await new Robinhood().fundamentals('GOOG');
  console.log(fundamentals);
}
run();
