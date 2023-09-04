const Discord = require("discord.js");

module.exports = {
    name: "help",
    aliases: [],
    description: "Shows all commands or gives help on specific command",
    usage: "help [command]",
    run: (client, message, args) => {
        if (!args[0]) {
            let commands = client.commands.map((cmd) => cmd.name);

            let fields = [];

            for (let i = 0; i < commands.length; i++) {
                fields.push({
                    name: commands[i],
                    value: client.commands.get(commands[i]).description,
                    inline: true,
                });
            }

            let embed = new Discord.EmbedBuilder()
                .setTitle("Help")
                .setDescription(
                    `Use \`${
                        client.settings.get(message.guild.id).prefix
                    }help <command>\` to get more information about a command.`
                )
                .addFields(fields);

            message.channel.send({ embeds: [embed] });
        } else {
            let command = args[0];
            if (client.commands.has(command)) command = client.commands.get(command);
            else if (client.aliases.has(command))
                command = client.commands.get(client.aliases.get(command));
            else return message.channel.send("That command does not exist!");

            let embed = new Discord.EmbedBuilder().setTitle(`${command.name}`).addFields([
                {
                    name: "Description",
                    value: command.description,
                    inline: false,
                },
                {
                    name: "Aliases",
                    value:
                        command.aliases.length > 0
                            ? command.aliases.join(", ")
                            : "Command has no aliases",
                    inline: false,
                },
                {
                    name: "Usage",
                    value: command.usage,
                    inline: false,
                },
            ]);

            message.channel.send({ embeds: [embed] });
        }
    },
};
