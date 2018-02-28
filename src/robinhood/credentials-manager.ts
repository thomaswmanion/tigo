import { fileUtil } from '../util/file.util';

export class CredentialsManager {
    static async readCredentials(): Promise<Credentials> {
        const credContents = (await fileUtil.readString('.', 'credentials')).trim();
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