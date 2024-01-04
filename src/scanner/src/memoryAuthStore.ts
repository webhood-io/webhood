import PocketBase, { BaseAuthStore } from 'pocketbase';
import fs from 'fs';

export class EnvAuthStore extends BaseAuthStore {
    save(token: any, model: any) {
        super.save(token, model);
        // save model to file
        fs.writeFileSync(".model.json", JSON.stringify(model));
        process.env.SCANNER_TOKEN = token;
    }
    get token() {
        return process.env.SCANNER_TOKEN || ""
    }
    get model() {
        return JSON.parse(fs.readFileSync(".model.json").toString())
    }
    get isValid() {
        return true
    }
}