import { spawn } from 'child_process';
import { createServer } from 'vite';
import electron from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startDevServer() {
  const server = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.ts'),
    server: {
      port: 3000,
    },
  });
  
  await server.listen();
  console.log('Vite dev server running at http://localhost:3000');
  
  return server;
}

async function startElectron() {
  const electronProcess = spawn(electron, ['.'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });
  
  electronProcess.on('close', () => {
    process.exit();
  });
}

async function main() {
  try {
    // Start Vite dev server
    await startDevServer();
    
    // Give Vite a moment to fully start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start Electron
    await startElectron();
  } catch (error) {
    console.error('Failed to start development environment:', error);
    process.exit(1);
  }
}

main();