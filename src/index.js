import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commandsArray = [];

// Carregar Comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const { default: command } = await import(`file://${filePath}`);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commandsArray.push(command.data.toJSON());
        }
    }
}

// Carregar Eventos
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const { default: event } = await import(`file://${filePath}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// Registrar Slash Commands na inicialização
client.once('ready', async () => {
    console.log(`🤖 Logado como ${client.user.tag}!`);
    console.log('🔄 Registrando comandos (/)...');
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandsArray },
        );
        console.log('✅ Comandos registrados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
});

if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'COLOQUE_SEU_TOKEN_AQUI') {
    console.error('❌ TOKEN NÃO ENCONTRADO! Coloque seu token no arquivo .env');
    process.exit(1);
}

// Loga o bot oficial no Discord
console.log('⏳ Tentando conectar aos servidores do Discord...');

client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('✅ Autorizado! Comunicação estabelecida no servidor do Discord.'))
    .catch(err => {
        console.error('❌ ERRO FATAL DE CONEXÃO: Ocorreu um problema no login!');
        console.error(err);
    });
