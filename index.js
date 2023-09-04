const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
    ],
});

const fs = require("fs");

const Enmap = require("enmap");

require("dotenv").config();

client.snipes = [];

client.levels = new Enmap("levels");
client.settings = new Enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: "deep",
    ensureProps: true,
    autoEnsure: {
        prefix: ".",
        modlogChannel: null,
        boostNotifications: false,
        boostChannel: null,
        boostMessage: null,
        modRole: null,
        adminRole: null,
        picRole: null,
        welcomeChannel: "welcome",
        welcomeMessage: "Say hello to {{user}}, everyone! We now have {{count}} members!",
    },
});
client.autoresponse = new Enmap({
    name: "autoresponse",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: "deep",
    ensureProps: true,
    autoEnsure: {},
});

client.commands = new Collection();
client.aliases = new Collection();

const commandFiles = fs.readdirSync("./commands/").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);

    if (command.aliases) {
        command.aliases.forEach((alias) => {
            client.aliases.set(alias, command.name);
        });
    }
}

client.on("ready", () => {
    console.log("Ready!");
});

client.on("guildCreate", async (guild) => {
    client.settings.set(guild.id, client.settings.get("default"));
});

client.on("guildDelete", async (guild) => {
    client.settings.delete(guild.id);
});

client.on("messageDelete", async (message) => {
    if (message.author.bot) return;

    client.snipes.push({
        message,
        channel: message.channel.id,
    });

    setTimeout(() => {
        client.snipes = [];
    }, 30000);
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
    let settings = client.settings.get(newMember.guild.id);
    if (settings.boostNotifications) {
        if (oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp) {
            let boostMessage = client.settings.get(newMember.guild.id).boostMessage;

            let channel = newMember.guild.channels.resolve(
                client.settings
                    .get(newMember.guild.id)
                    .boostChannel.replace("<#", "")
                    .replace(">", "")
            );

            if (typeof boostMessage === "string") {
                channel.send(
                    boostMessage
                        .replace("{{user}}", newMember.user.tag)
                        .replace("{{count}}", newMember.guild.premiumSubscriptionCount)
                );
            } else {
                boostMessage.thumbnail.url = newMember.user.displayAvatarURL();
                boostMessage.footer.text = boostMessage.footer.text.replace(
                    "{{count}}",
                    newMember.guild.premiumSubscriptionCount
                );
                boostMessage.description = boostMessage.description.replace(
                    "{{user}}",
                    newMember.user.tag
                );
                channel.send({ embeds: [boostMessage] });
            }
        }
    }
});

client.on("guildMemberRemove", async (member) => {
    if (member.user.bot) return;

    client.levels.delete(`${member.guild.id}-${member.user.id}`);
});

client.on("guildMemberAdd", async (member) => {
    const settings = client.settings.get(member.guild.id);
    if (settings.welcomeChannel) {
        let channel = member.guild.channels.resolve(
            client.settings.get(member.guild.id).welcomeChannel.replace("<#", "").replace(">", "")
        );
        let msg = settings.welcomeMessage;
        if (channel) {
            if (typeof msg === "string") {
                channel.send(
                    member +
                        settings.welcomeMessage
                            .replace("{{user}}", member.user.tag)
                            .replace("{{count}}", member.guild.memberCount)
                );
            } else {
                msg.thumbnail.url = member.user.displayAvatarURL();
                msg.footer.text = msg.footer.text.replace(
                    "{{count}}",
                    member.guild.memberCount.toLocaleString()
                );

                channel.send({ content: `${member}`, embeds: [msg] });
            }
        }
    }
});

client.on("guildMemberRemove", async (member) => {
    const settings = client.settings.get(member.guild.id);
    if (settings.welcomeChannel) {
        const welcomeChannel = member.guild.channels.cache.find(
            (c) => c.name === settings.welcomeChannel
        );
        if (welcomeChannel) {
            welcomeChannel.send(`\`${member.user.tag}\` left the server`);
        }
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.guild) {
        if (client.autoresponse.get(message.guild.id).responses[message.content]) {
            message.channel.send(
                client.autoresponse.get(message.guild.id).responses[message.content]
            );
        }

        const key = `${message.guild.id}-${message.author.id}`;

        client.levels.ensure(key, {
            user: message.author.id,
            guild: message.guild.id,
            xp: 0,
            level: 1,
        });

        client.levels.math(key, "+", Math.floor(Math.random() * 250), "xp");

        const nextLevel =
            350 *
            Math.round(
                (client.levels.get(key, "level") * (client.levels.get(key, "level") + 1)) / 2
            );

        if (client.levels.get(key, "xp") >= nextLevel) {
            client.levels.inc(key, "level");
            message.channel.send(
                `${message.author} you are now level ${client.levels.get(key, "level")} well done`
            );

            if (client.levels.get(key, "level") % 5 === 0) {
                let roles = message.guild.roles.cache.find(
                    (r) => r.name === `☆ . ${client.levels.get(key, "level")}`
                );

                if (!roles) {
                    return;
                } else {
                    message.member.roles.add(roles);
                }
            }
        }
    }

    let settings = client.settings.get(message.guild.id);
    let prefix = settings.prefix;

    const regex =
        /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/gi;

    if (
        !message.member.permissions.toArray().includes("ManageMessages") &&
        message.content.match(regex)
    ) {
        if (message.channel.id === "1069026513103626330") return;
        await message.delete();
        return message.channel.send(`\`${message.author.tag}\`, don't send invite links`);
    }

    if (message.content.startsWith(`<@${client.user.id}>` || `<@!${client.user.id}>`)) {
        prefix = `<@${client.user.id}> `;
    } else {
        prefix = settings.prefix;
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    if (client.commands.has(command)) {
        command = client.commands.get(command);
    } else if (client.aliases.has(command)) {
        command = client.commands.get(client.aliases.get(command));
    } else {
        return;
    }

    command.run(client, message, args);
});

client.login(process.env.TOKEN);
