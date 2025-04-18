import { config } from 'dotenv';
import fs from 'fs';
import { z } from 'zod';

switch (process.env.NODE_ENV) {
    case 'test':
    case 'production': {
        if (fs.existsSync(`.${process.env.NODE_ENV}.env`)) {
            console.log(`Using .${process.env.NODE_ENV}.env file`);
            config({ path: `bin/config/.${process.env.NODE_ENV}.env` });
            console.log('Loaded .production.env file');
        } else {
            console.log(
                `File .${process.env.NODE_ENV}.env does not exist. Make sure you passed environment variables!`
            );
        }
        // else, we assume they are passed on launch
        // by the hosting provider (e.g. Heroku, Vercel, Coolify, etc.)
        break;
    }
    case 'development':
        console.log('Using .development.env file');
        config({ path: 'bin/config/.development.env' });
        console.log('Loaded .development.env file');
        break;
    default:
        throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}.`);
}

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// or use import.meta.env if you are using Vite
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('Environment variable validation failed:', _env.error.format());
    process.exit(1);
}

export default _env.data;
