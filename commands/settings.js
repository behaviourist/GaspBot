const Discord = require("discord.js");

module.exports = {
    name: "settings",
    aliases: ["config", "cfg"],
    description: "View or change the server settings",
    usage: "settings [refresh|view <setting> <value>]",
    run: (client, message, args) => {
        if (!message.member.permissions.toArray().includes("Administrator")) return;

        let settings = client.settings.get(message.guild.id);

        if (!args[0]) {
            console.log(settings);
            let embed = new Discord.EmbedBuilder();
            let fields = [];

            Object.entries(settings).forEach((k) => {
                if (typeof k[1] !== "string" && k[0] === "welcomeMessage") k[1] = "Embed";
                if (typeof k[1] !== "string" && k[0] === "boostMessage") k[1] = "Embed";

                fields.push({
                    name: k[0],
                    value: k[1] ? `${k[1]}` : "N/A",
                    inline: true,
                });
            });

            embed.setTitle("Settings").addFields(fields).setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        if (args[0] === "refresh") {
            client.settings.ensure(message.guild.id, {
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
            });

            return message.channel.send("settings refreshed");
        }

        if (args[0] === "view") {
            if (!args[1]) return message.channel.send("Please provide a setting to view");

            if (args[1] === "welcomeMessage") {
                let msg = settings.welcomeMessage;

                if (typeof msg === "string")
                    return message.channel.send(
                        `Welcome message is \`${msg
                            .replace("{{user}}", message.author)
                            .replace("{{count}}", message.guild.memberCount)}\``
                    );
                else {
                    msg.description = msg.description
                        .replace("{{user}}", message.author)
                        .replace("{{count}}", message.guild.memberCount);
                    msg.thumbnail.url = message.author.displayAvatarURL({ dynamic: true });
                    msg.footer.text = msg.footer.text.replace(
                        "{{count}}",
                        message.guild.memberCount
                    );
                    return message.channel.send({ embeds: [msg] });
                }
            }

            if (args[1] === "boostMessage") {
                let msg = settings.boostMessage;

                if (typeof msg === "string")
                    return message.channel.send(
                        `boostMessage is \`${msg
                            .replace("{{user}}", message.author)
                            .replace("{{count}}", message.guild.memberCount)}\``
                    );
                else {
                    msg.description = msg.description
                        .replace("{{user}}", message.author.tag)
                        .replace("{{count}}", message.guild.premiumSubscriptionCount);
                    msg.thumbnail.url = message.author.displayAvatarURL({ dynamic: true });
                    msg.footer.text = msg.footer.text.replace(
                        "{{count}}",
                        message.guild.premiumSubscriptionCount
                    );
                    return message.channel.send({ embeds: [msg] });
                }
            }
        }

        if (args[0] === "set") {
            if (!args[1]) return message.channel.send("Please provide a setting to set");
            if (!args[2]) return message.channel.send(`Please provide a value for ${args[1]}`);

            if (!Object.keys(settings).includes(args[1]))
                return message.channel.send("That setting does not exist.");

            if (
                ["welcomeChannel", "modlogChannel", "boostChannel"].includes(args[1]) &&
                message.mentions.channels.length === 0
            )
                return message.channel.send("Please provide a channel.");

            if (
                ["modRole", "adminRole", "picRole"].includes(args[1]) &&
                message.mentions.roles.length === 0
            )
                return message.channel.send("Please provide a role.");

            if (args[1] === "boostNotifications") {
                let val = message.content.toLowerCase().includes("true") ? true : false;

                settings.boostNotifications = val;
                client.settings.set(message.guild.id, settings);

                return message.channel.send(`boostNotifications is now ${val}`);
            }

            if (args[1] === "boostMessage") {
                let msg = args.slice(2).join(" ");

                if (args[2] === "embed") {
                    let data = args[3].split("data=")[1];
                    let buff = new Buffer.from(data, "base64");
                    let text = buff.toString("utf-8");

                    let embed = JSON.parse(text)["messages"][0]["data"]["embeds"][0];

                    settings.boostMessage = embed;
                    client.settings.set(message.guild.id, settings);

                    return message.channel.send(
                        `Set boostMessage to \`embed\` to view it type \`${settings.prefix}settings view boostMessage\``
                    );
                }

                settings.boostMessage = msg;
                client.settings.set(message.guild.id, settings);
                return message.channel.send(`Set boostMessage to \`${msg}\``);
            } else if (args[1] === "welcomeMessage") {
                let msg = args.slice(2).join(" ");

                if (args[2] === "embed") {
                    let data = args[3].split("data=")[1];
                    let buff = new Buffer.from(data, "base64");
                    let text = buff.toString("utf-8");

                    let embed = JSON.parse(text)["messages"][0]["data"]["embeds"][0];

                    settings.welcomeMessage = embed;
                    client.settings.set(message.guild.id, settings);

                    return message.channel.send(
                        `Set welcome message to embed to view it type \`${settings.prefix}settings view welcomeMessage\``
                    );
                }

                settings.welcomeMessage = msg;
                client.settings.set(message.guild.id, settings);
                return message.channel.send(`Set welcome message to \`${msg}\``);
            } else {
                settings[args[1]] = args[2];
                client.settings.set(message.guild.id, settings);
                return message.channel.send(`Set ${args[1]} to ${args[2]}`);
            }
        }
    },
};
