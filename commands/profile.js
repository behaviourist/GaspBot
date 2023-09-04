const Discord = require("discord.js");

module.exports = {
    name: "profile",
    aliases: [],
    description: "Shows your profile",
    usage: "profile",
    run: (client, message, args) => {
        let info = client.levels.get(`${message.guild.id}-${message.author.id}`);

        const nextLevelXP = 350 * Math.round((info.level * (info.level + 1)) / 2);
        const currentLevelXP = 350 * Math.round(((info.level - 1) * info.level) / 2);
        const actualXP = info.xp;
        const xpNeeded = nextLevelXP - actualXP;

        const progress = Math.trunc(
            ((actualXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 10
        );

        const bar = new Array(10).fill("\\🖤");
        for (let i = 0; i < progress; i++) {
            bar[i] = "\\❤️";
        }
        const barString = bar.join("");

        let embed = new Discord.EmbedBuilder()
            .setTitle(`${message.author.tag}'s profile`)
            .addFields([
                {
                    name: "Level",
                    value: `${info.level} (${info.xp.toLocaleString()}xp)`,
                    inline: true,
                },
            ])
            .setDescription(`Next level: ${barString} ${xpNeeded.toLocaleString()}xp`)
            .setThumbnail(message.author.avatarURL());

        message.channel.send({
            embeds: [embed],
        });
    },
};
