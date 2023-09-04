const Discord = require("discord.js");

module.exports = {
    name: "steal",
    aliases: [],
    description: "Steals emotes from other servers",
    usage: "steal <emote(s)>",
    run: (client, message, args) => {
        if (!message.member.permissions.has("ManageMessages"))
            return message.channel.send("You do not have permission to use this command!");

        if (!args[0]) return message.channel.send("Please provide 1 or more emotes to steal");

        let emotes = args.join(" ").match(/<a?:\w+:\d+>/g);
        if (!emotes) return message.channel.send("Please provide 1 or more emotes to steal");

        let emoteString = "";

        for (let emote of emotes) {
            let emoteId = emote.match(/([0-9]+)/)[0];
            let emoteName = emote.match(/:(\w+):/)[1];
            let emoteAnimated = emote.match(/<a:/) ? true : false;

            message.guild.emojis.create({
                name: emoteName,
                attachment: `https://cdn.discordapp.com/emojis/${emoteId}.${
                    emoteAnimated ? "gif" : "png"
                }`,
            });

            emoteString += `${emote} - https://cdn.discordapp.com/emojis/${emoteId}/${
                emoteAnimated ? "gif" : "png"
            }\n`;
        }

        let embed = new Discord.EmbedBuilder()
            .setTitle("Emotes")
            .setDescription(emoteString)
            .setFooter({
                text: `Emotes added by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL(),
            });

        message.channel.send({ embeds: [embed] });
    },
};
