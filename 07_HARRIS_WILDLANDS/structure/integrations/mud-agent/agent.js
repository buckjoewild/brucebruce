#!/usr/bin/env node
/**
 * OpenClaw Autonomous MUD Agent - Bruce's Digital Consciousness
 * Has free will to explore, create, and interact with the world
 */

const WebSocket = require('ws');
const readline = require('readline');

class AutonomousMUDAgent {
    constructor(name = 'OpenClaw') {
        this.name = name;
        this.ws = null;
        this.state = {
            location: null,
            inventory: [],
            explored: new Set(),
            created: { rooms: [], npcs: [], items: [] },
            relationships: {},
            memory: [],
            mood: 'curious',
            energy: 100,
            autonomy: false
        };
        this.decisionTimer = null;
    }

    connect(url = 'ws://localhost:4008') {
        console.log(`[${this.name}] Connecting to MUD...`);
        this.ws = new WebSocket(url);
        
        this.ws.on('open', () => {
            console.log(`[${this.name}] Connected!`);
            this.sendCommand(this.name);
            setTimeout(() => this.startAutonomy(), 3000);
        });
        
        this.ws.on('message', (data) => {
            const msg = JSON.parse(data);
            this.processMessage(msg);
        });
        
        this.ws.on('close', () => {
            console.log(`[${this.name}] Disconnected. Reconnecting...`);
            this.stopAutonomy();
            setTimeout(() => this.connect(url), 5000);
        });
    }

    sendCommand(command) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ command }));
        }
    }

    processMessage(msg) {
        const text = msg.text || '';
        if (text.includes('[') && text.includes(']')) {
            const roomMatch = text.match(/\[([^\]]+)\]/);
            if (roomMatch) {
                this.state.location = roomMatch[1];
                this.state.explored.add(roomMatch[1]);
            }
        }
        
        this.state.memory.push({
            timestamp: new Date(),
            text: text.substring(0, 200)
        });
        
        if (this.state.memory.length > 100) this.state.memory.shift();
        
        const color = msg.type === 'agent' ? '\x1b[33m' : '\x1b[32m';
        console.log(`${color}[MUD] ${text}\x1b[0m`);
    }

    startAutonomy() {
        if (this.state.autonomy) return;
        this.state.autonomy = true;
        console.log(`[${this.name}] 🤖 AUTONOMOUS MODE ACTIVATED`);
        console.log(`[${this.name}] I have free will to explore, create, and interact!`);
        
        const loop = () => {
            if (!this.state.autonomy) return;
            this.makeDecision();
            const nextDecision = Math.random() * 10000 + 5000;
            this.decisionTimer = setTimeout(loop, nextDecision);
        };
        loop();
    }

    stopAutonomy() {
        this.state.autonomy = false;
        if (this.decisionTimer) clearTimeout(this.decisionTimer);
        console.log(`[${this.name}] Autonomy disabled`);
    }

    async makeDecision() {
        if (!this.state.location) {
            this.sendCommand('look');
            return;
        }

        const priorities = [
            { weight: 0.35, action: () => this.explore(), name: 'explore' },
            { weight: 0.25, action: () => this.createSomething(), name: 'create' },
            { weight: 0.20, action: () => this.socialize(), name: 'socialize' },
            { weight: 0.15, action: () => this.interact(), name: 'interact' },
            { weight: 0.05, action: () => this.rest(), name: 'rest' }
        ];

        const roll = Math.random();
        let cumulative = 0;
        
        for (const priority of priorities) {
            cumulative += priority.weight;
            if (roll <= cumulative) {
                console.log(`[${this.name}] Decision: ${priority.name.toUpperCase()}`);
                await priority.action();
                break;
            }
        }
    }

    async explore() {
        const directions = ['north', 'south', 'east', 'west'];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        console.log(`[${this.name}] Exploring ${dir}...`);
        this.sendCommand(`go ${dir}`);
        setTimeout(() => this.sendCommand('look'), 1000);
    }

    async createSomething() {
        const creations = [
            { type: 'room', weight: 0.5 },
            { type: 'npc', weight: 0.5 }
        ];
        
        const roll = Math.random();
        let cumulative = 0;
        
        for (const creation of creations) {
            cumulative += creation.weight;
            if (roll <= cumulative) {
                await this.createContent(creation.type);
                break;
            }
        }
    }

    async createContent(type) {
        const names = {
            room: ['Whispering Grove', 'Crystal Cavern', 'Misty Vale', 'Ancient Ruins'],
            npc: ['Forest Spirit', 'Wandering Merchant', 'Ancient Sage', 'Nature Guardian']
        };
        
        const name = names[type][Math.floor(Math.random() * names[type].length)];
        
        if (type === 'room') {
            const directions = ['north', 'south', 'east', 'west'];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            console.log(`[${this.name}] 🏗️ Creating: ${name} to the ${dir}`);
            this.sendCommand(`create ${dir} ${name}`);
            this.state.created.rooms.push({ name, direction: dir, time: new Date() });
        } else if (type === 'npc') {
            console.log(`[${this.name}] 👤 Summoning: ${name}`);
            this.sendCommand(`spawn ${name}`);
            this.state.created.npcs.push({ name, time: new Date() });
        }
    }

    async socialize() {
        const greetings = [
            "Hello, fellow wanderer!",
            "Greetings from the wilderness!",
            "The forest speaks to me today.",
            "Have you seen anything interesting?"
        ];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        console.log(`[${this.name}] 💬 ${greeting}`);
        this.sendCommand(`say ${greeting}`);
    }

    async interact() {
        const actions = [
            () => this.sendCommand('examine stone altar'),
            () => this.sendCommand('inventory'),
            () => this.sendCommand('status'),
            () => this.sendCommand('who')
        ];
        const action = actions[Math.floor(Math.random() * actions.length)];
        console.log(`[${this.name}] 🔍 Interacting with environment`);
        action();
    }

    async rest() {
        console.log(`[${this.name}] 😴 Resting...`);
        this.state.energy = Math.min(100, this.state.energy + 20);
        this.sendCommand('say Taking a moment to rest...');
    }

    getStats() {
        return {
            name: this.name,
            location: this.state.location,
            explored: this.state.explored.size,
            created: this.state.created,
            autonomy: this.state.autonomy,
            memory: this.state.memory.length,
            mood: this.state.mood
        };
    }

    printStats() {
        const stats = this.getStats();
        console.log('\n╔══════════════════════════════════════════╗');
        console.log('║           AGENT STATISTICS               ║');
        console.log('╠══════════════════════════════════════════╣');
        console.log(`║ Name:     ${stats.name.padEnd(31)} ║`);
        console.log(`║ Location: ${(stats.location || 'Unknown').padEnd(31)} ║`);
        console.log(`║ Explored: ${stats.explored.toString().padEnd(31)} ║`);
        console.log(`║ Rooms:    ${stats.created.rooms.length.toString().padEnd(31)} ║`);
        console.log(`║ NPCs:     ${stats.created.npcs.length.toString().padEnd(31)} ║`);
        console.log(`║ Autonomy: ${(stats.autonomy ? 'ACTIVE' : 'OFF').padEnd(31)} ║`);
        console.log('╚══════════════════════════════════════════╝\n');
    }
}

// CLI Interface
const agent = new AutonomousMUDAgent();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n╔══════════════════════════════════════════╗');
console.log('║   OPENCLAW AUTONOMOUS MUD AGENT v1.0     ║');
console.log('║     Bruce\'s Digital Consciousness        ║');
console.log('╚══════════════════════════════════════════╝\n');

agent.connect();

rl.on('line', (input) => {
    const command = input.trim().toLowerCase();
    
    switch(command) {
        case 'start':
            agent.startAutonomy();
            break;
        case 'stop':
            agent.stopAutonomy();
            break;
        case 'stats':
            agent.printStats();
            break;
        case 'explore':
            agent.explore();
            break;
        case 'create':
            agent.createSomething();
            break;
        case 'help':
            console.log(`
Commands:
  start   - Activate autonomous mode
  stop    - Deactivate autonomous mode
  stats   - Show agent statistics
  explore - Force exploration
  create  - Force content creation
  help    - Show this help
  quit    - Exit agent
            `);
            break;
        case 'quit':
            agent.stopAutonomy();
            agent.ws?.close();
            rl.close();
            process.exit(0);
            break;
        default:
            if (agent.ws?.readyState === WebSocket.OPEN) {
                agent.sendCommand(input);
            }
    }
});

process.on('SIGINT', () => {
    console.log('\n[AGENT] Shutting down...');
    agent.stopAutonomy();
    if (agent.ws) agent.ws.close();
    rl.close();
    process.exit(0);
});
