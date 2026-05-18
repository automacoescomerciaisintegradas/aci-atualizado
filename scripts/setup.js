#!/usr/bin/env node

/**
 * ACI - Automacoes Comerciais Integradas
 * Setup & Deployment Script
 * 
 * Works on Windows and Linux.
 */

import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import os from 'os';
import http from 'http';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { SecurityGuard, SecurityViolation } from './securityGuard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const securityGuard = new SecurityGuard(ROOT_DIR);

// Configuration
const CONFIG = {
    WEBHOOK_URL: "http://144.91.118.78:3000/api/deploy/c4323a889a4b59c23b87eb69cd7d3097b1e7503e64d6ef2a",
    APP_NAME: "aci-automacoes",
    VPS_USER: "root",
    VPS_HOST: "144.91.118.78"
};

// ANSI Colors
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    bgRed: "\x1b[41m"
};

const print = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    header: (msg) => {
        console.log(`\n${colors.cyan}${colors.bright}=== ${msg} ===${colors.reset}`);
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// --- Helpers ---

const runCommand = (command, args, options = {}) => {
    return new Promise((resolve, reject) => {
        const fullCommand = `${command} ${(args || []).join(' ')}`.trim();
        try {
            securityGuard.validate(fullCommand);
        } catch (e) {
            if (e instanceof SecurityViolation) {
                return reject(e);
            }
            return reject(new Error(`Security validation failed: ${e.message}`));
        }

        // Construct command string for Windows shell to avoid array issues/warnings
        let spawnCmd = command;
        let spawnArgs = args;
        let spawnOpts = {
            cwd: ROOT_DIR,
            stdio: 'inherit',
            shell: true,
            ...options
        };

        // On Windows, it's often safer to pass the full command string if using shell: true
        if (process.platform === 'win32' && spawnOpts.shell) {
            // Just let spawn handle it, but we might trap errors better
        }

        const child = spawn(spawnCmd, spawnArgs, spawnOpts);

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command "${command}" failed with code ${code}`));
            }
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
};

const checkPrerequisite = (cmd, args = ['--version']) => {
    try {
        const fullCommand = `${cmd} ${args.join(' ')}`.trim();
        securityGuard.validate(fullCommand);
        execSync(fullCommand, { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
};

const isDockerRunning = () => {
    try {
        securityGuard.validate('docker info');
        execSync('docker info', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
};

// --- Actions ---

const checkEnvironment = async () => {
    print.header("Checking Environment");

    const tools = [
        { name: 'node', cmd: 'node' },
        { name: 'npm', cmd: 'npm' },
        { name: 'git', cmd: 'git' },
    ];

    let missing = [];

    for (const tool of tools) {
        if (checkPrerequisite(tool.cmd)) {
            print.success(`${tool.name} is installed.`);
        } else {
            print.error(`${tool.name} is NOT installed.`);
            missing.push(tool.name);
        }
    }

    // Check Docker specifically
    if (checkPrerequisite('docker')) {
        if (isDockerRunning()) {
            print.success("docker is installed and running.");
        } else {
            print.error("docker is installed but the DAEMON IS NOT RUNNING.");
            print.warn("Please start Docker Desktop or the Docker service.");
            missing.push('docker-daemon');
        }
    } else {
        print.error("docker is NOT installed.");
        missing.push('docker');
    }

    // Check .env
    const envPath = path.join(ROOT_DIR, '.env');
    if (fs.existsSync(envPath)) {
        print.success(".env file exists.");
    } else {
        print.warn(".env file missing!");
        const answer = await askQuestion(`${colors.yellow}Create .env from .env.example? (y/n): ${colors.reset}`);
        if (answer.toLowerCase() === 'y') {
            try {
                fs.copyFileSync(path.join(ROOT_DIR, '.env.example'), envPath);
                print.success(".env created.");
            } catch (e) {
                print.error("Failed to create .env: " + e.message);
            }
        }
    }

    return missing;
};

const installDependencies = async () => {
    print.header("Installing Dependencies");
    try {
        await runCommand('npm', ['install']);
        print.success("Dependencies installed successfully.");
    } catch (e) {
        print.error("Failed to install dependencies.");
        console.error(e);
    }
};

const setupDatabase = async () => {
    print.header("Setting up Database");
    try {
        print.info("Generating Prisma client...");
        await runCommand('npx', ['prisma', 'generate']);
        print.success("Database setup complete (Prisma Client generated).");
        print.warn("If you need to push schema changes, run 'npx prisma db push' manually.");
    } catch (e) {
        print.error("Database setup failed: " + e.message);
    }
};

const triggerWebhookDeploy = async () => {
    print.header("Triggering Webhook Deployment");
    print.info(`Target: ${CONFIG.WEBHOOK_URL}`);
    print.info("This is the RECOMMENDED method for EasyPanel updates.");

    const confirm = await askQuestion(`Are you sure you want to trigger deployment? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
        print.info("Cancelled.");
        return;
    }

    return new Promise((resolve, reject) => {
        const req = http.request(CONFIG.WEBHOOK_URL, {
            method: 'POST'
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    print.success(`Deployment triggered! Status: ${res.statusCode}`);
                    console.log("Response:", data);
                } else {
                    print.error(`Deployment failed. Status: ${res.statusCode}`);
                    console.log("Response:", data);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            print.error(`Request failed: ${e.message}`);
            resolve();
        });

        req.end();
    });
};

const sshDeploy = async () => {
    print.header("SSH Deployment (Legacy)");
    print.warn("This method connects via SSH to the VPS.");
    print.warn("It requires your public SSH key to be authorized on the VPS.");

    const confirm = await askQuestion(`Connect to ${CONFIG.VPS_USER}@${CONFIG.VPS_HOST}? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
        return;
    }

    const cmds = [
        'mkdir -p /opt/projects/aci-automacoes',
        'cd /opt/projects/aci-automacoes',
        'git pull origin main || git pull origin master',
        'docker build -t aci-automacoes:latest .',
        'docker stack deploy -c docker-compose.yml aci-automacoes --resolve-image=never'
    ];

    // Join commands
    const remoteScript = cmds.join(' && ');

    // Use StrictHostKeyChecking=no to avoid prompt issues in automation, though less secure
    const sshArgs = [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'UserKnownHostsFile=/dev/null',
        `${CONFIG.VPS_USER}@${CONFIG.VPS_HOST}`,
        `"${remoteScript.replace(/"/g, '\\"')}"`
    ];

    try {
        print.info("Executing remote commands...");
        await runCommand('ssh', sshArgs);
        print.success("Remote commands executed.");
    } catch (e) {
        print.error("SSH Deployment failed.");
        print.info("Tip: If you see 'Host key verification failed', the script now tries to bypass it, but keys must stick work.");
        print.info("Tip: Ensure you have added your SSH key to the VPS.");
    }
};

const buildDockerLocal = async () => {
    print.header("Build Docker Image Locally");

    if (!isDockerRunning()) {
        print.error("Docker daemon is NOT running. Please start Docker Desktop.");
        return;
    }

    try {
        await runCommand('docker', ['build', '-t', 'aci-automacoes:latest', '.']);
        print.success("Build complete.");
    } catch (e) {
        print.error("Build failed: " + e.message);
    }
}

// --- Menu ---

const showMenu = () => {
    console.log(`\n${colors.cyan}--- ACI Installer & Manager ---${colors.reset}`);
    console.log(`1. Check Environment`);
    console.log(`2. Install Dependencies`);
    console.log(`3. Setup Database`);
    console.log(`4. Start Development Server`);
    console.log(`5. Deploy via Webhook (RECOMMENDED)`);
    console.log(`6. Deploy via SSH (Advanced)`);
    console.log(`7. Build Docker Image (Local)`);
    console.log(`0. Exit`);
};

const main = async () => {
    // Clear screen
    console.clear();
    print.header("ACI Automacoes - Setup Tool");

    // Initial check
    await checkEnvironment();

    while (true) {
        showMenu();
        const answer = await askQuestion(`\n${colors.yellow}Select an option: ${colors.reset}`);

        switch (answer.trim()) {
            case '1':
                await checkEnvironment();
                break;
            case '2':
                await installDependencies();
                break;
            case '3':
                await setupDatabase();
                break;
            case '4':
                print.header("Starting Dev Server...");
                await runCommand('npm', ['run', 'dev:all']);
                break;
            case '5':
                await triggerWebhookDeploy();
                break;
            case '6':
                await sshDeploy();
                break;
            case '7':
                await buildDockerLocal();
                break;
            case '0':
                print.info("Exiting...");
                rl.close();
                process.exit(0);
                break;
            default:
                print.error("Invalid option.");
        }

        await askQuestion(`\nPress ENTER to continue...`);
    }
};

// Handle Ctrl+C
rl.on('SIGINT', () => {
    console.log("\nExiting...");
    process.exit(0);
});

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
