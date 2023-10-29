import PocketBase, { BaseAuthStore } from 'pocketbase';


export class EnvAuthStore extends BaseAuthStore {
    save(token: any, model: any) {
        super.save(token, model);
        process.env.API_KEY = token;
    }
    get token() {
        return process.env.API_KEY || ""
    }
    get isValid() {
        return true
    }
}