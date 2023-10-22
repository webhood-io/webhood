import PocketBase, { BaseAuthStore } from 'pocketbase';


export class EnvAuthStore extends BaseAuthStore {
    save(token: any, model: any) {
        super.save(token, model);
        process.env.SCANNER_TOKEN = token;
    }
    get token() {
        return process.env.SCANNER_TOKEN || ""
    }
    get isValid() {
        return true
    }
}