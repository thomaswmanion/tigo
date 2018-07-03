import { SecretsManager } from 'aws-sdk'

const secretsManager = new SecretsManager({
    endpoint: 'https://secretsmanager.us-east-1.amazonaws.com',
    region: 'us-east-1'
});
export class CredentialsManager {

    static async readCredentials(): Promise<Credentials> {
        const credContents = await secretsManager.getSecretValue({ SecretId: 'robinpw' }).promise();
        const credObj = JSON.parse(credContents.SecretString || '{}');
        let username: string = '';
        let password: string = '';
        for (let property in credObj) {
            username = property;
            password = credObj[property];
        }
        return new Credentials(username, password);
    }
}

export class Credentials {
    constructor(
        public username: string,
        public password: string
    ) { }
}
