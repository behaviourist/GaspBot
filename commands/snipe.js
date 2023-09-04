const Discord = require("discord.js");

module.exports = {
    name: "snipe",
    aliases: [],
    description: "Snipes the last deleted message",
    usage: "snipe [channel]",
    run: (client, message, args) => {
        let channel =
            message.mentions.channels.first() ||
            message.guild.channels.cache.get(args[0]) ||
            message.channel;

        let snipes = client.snipes.filter((s) => s.channel === channel.id);

        if (snipes.length > 0) {
            message.channel.send(`Found ${snipes.length} snipes in ${channel.name}.`);

            let embed = new Discord.EmbedBuilder()
                .setTitle(`snipes in ${channel.name}`)
                .setDescription(
                    snipes
                        .map((s) => {
                            return `**${s.message.author.tag}**: ${s.message.content} - ${s.message.createdTimestamp}`;
                        })
                        .join("\n")
                );

            message.channel.send({ embeds: [embed] });
        } else {
            message.channel.send("No snipes found!");
        }
    },
};
