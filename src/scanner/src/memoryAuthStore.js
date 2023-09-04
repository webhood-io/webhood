import PocketBase, { BaseAuthStore } from 'pocketbase';

export class EnvAuthStore extends BaseAuthStore {
    save(token, model) {
        super.save(token, model);
        process.env.API_KEY = token;
        // your custom business logic...
    }
    get token() {
        return process.env.API_KEY
    }
    get isValid() {
        return true
    }
}