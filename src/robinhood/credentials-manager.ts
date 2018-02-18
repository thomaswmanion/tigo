import { fileUtil } from '../util/file.util';
import * as path from 'path';

export class CredentialsManager {
    static async readCredentials(): Promise<Credentials> {
        const credFile = path.join(fileUtil.tempestHome, 'credentials');
        const credContents = (await fileUtil.readString('.', credFile)).trim();
        const pieces = credContents.split(':');
        return new Credentials(pieces[0], pieces[1]);
    }
}

export class Credentials {
    constructor(
        public username: string,
        public password: string
    ) {}
}