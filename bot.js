const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

// Initialize the bot with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Define radio stations
const stations = {
    kissFM: 'https://online.kissfm.ua/KissFM_HD',
    bassRadio: 'https://s2.ssl-stream.com/listen/uk_bass_radio/stream',
    danceStream: 'https://dancestream.danceradiouk.com/'
};

let currentStation = stations.kissFM; // Default station
let player; // Keep player in scope for reuse
let connection; // Keep connection in scope for reuse

// Log in when the bot is ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Respond to the "!join" command
client.on('messageCreate', async message => {
    if (message.content === '!join') {
        // Check if the user is in a voice channel
        if (message.member.voice.channel) {
            connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            player = createAudioPlayer();
            const resource = createAudioResource(currentStation);

            player.play(resource);
            connection.subscribe(player);

            message.reply(`Streaming now: ${currentStation}`);
        } else {
            message.reply('You need to join a voice channel first!');
        }
    }

    // Command to change the station
    if (message.content.startsWith('!change')) {
        const station = message.content.split(' ')[1]; // Get the station name from the command

        if (stations[station]) {
            currentStation = stations[station];
            message.reply(`Changed station to ${station}!`);

            // If the player is currently playing, stop it and play the new station
            if (player) {
                player.stop(); // Stop current audio

                const resource = createAudioResource(currentStation); // Create new audio resource
                player.play(resource); // Play the new station
                connection.subscribe(player); // Re-subscribe the player to the voice channel
            }
        } else {
            message.reply('Station not found! Available stations: kissFM, bassRadio, danceStream.');
        }
    }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN); // Replace with your actual token


