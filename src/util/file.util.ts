import * as fs from 'fs-extra';
import * as path from 'path';

export class FileUtil {
  userHome: string = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] as string;
  tempestHome: string = path.join(this.userHome, 'tempest');

  async saveObject(directoryName: string, filename: string, obj: any): Promise<void> {
    return this.saveString(directoryName, filename, JSON.stringify(obj));
  }
  async saveString(directoryName: string, filename: string, obj: any): Promise<void> {
    const dirPath = path.join(this.tempestHome, directoryName);
    await fs.ensureDir(dirPath);
    await fs.writeFile(path.join(dirPath, filename), obj, 'utf-8');
  }

  async readString(directoryName: string, filename: string): Promise<any> {
    const dirPath = path.join(this.tempestHome, directoryName);
    return await fs.readFile(path.join(dirPath, filename), 'utf-8');
  }

  async removeFile(directoryName: string, filename: string): Promise<void> {
    return await fs.remove(path.join(this.tempestHome, directoryName, filename));
  }

  async appendFile(directoryName: string, filename: string, data: string): Promise<void> {
    await fs.ensureDir(path.join(this.tempestHome, directoryName));
    return await fs.appendFile(path.join(this.tempestHome, directoryName, filename), data);
  }

  async readObject(directoryName: string, filename: string): Promise<any> {
    return JSON.parse(await this.readString(directoryName, filename));
  }

  async readLocalObject(f: string): Promise<any> {
    return JSON.parse(await fs.readFile(f, 'utf-8'));
  }

  async ls(directoryName: string): Promise<string[]> {
    const files = await fs.readdir(path.join(this.tempestHome, directoryName));
    return files;
  }

  async empty(directoryName: string): Promise<void> {
    return fs.emptyDir(path.join(this.tempestHome, directoryName));
  }

  async exists(directoryName: string, file: string): Promise<boolean> {
    const f = path.join(this.tempestHome, directoryName, file);
    return fs.pathExists(f);
  }

  async readSymbols(): Promise<string[]> {
    return this.readLocalObject(__dirname + '/symbols.json');
  }
}

export const fileUtil = new FileUtil();
