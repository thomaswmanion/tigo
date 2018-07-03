import { Robinhood } from "../../robinhood/robinhood.api";
import { CredentialsManager } from "../../robinhood/credentials-manager";

export async function run() {
  const creds = await CredentialsManager.readCredentials();
  const robinhood = new Robinhood(creds.username, creds.password);
  await robinhood.login();
  const positions = await robinhood.positions();
  console.log(positions);
}
run();
