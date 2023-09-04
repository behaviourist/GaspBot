const Discord = require("discord.js");

module.exports = {
    name: "leaderboard",
    aliases: ["lb"],
    description: "Shows the leaderboard",
    usage: "leaderboard [refresh]",
    run: (client, message, args) => {
        if (args[0] === "refresh") {
            let a = client.levels.filter((p) => p.guild === message.guild.id).array();
            for (let i of a) {
                client.levels.delete(`${i.guild}-${i.user}`);
            }
        } else {
            const filtered = client.levels.filter((p) => p.guild === message.guild.id).array();

            const sorted = filtered.sort((a, b) => b.xp - a.xp);

            const top10 = sorted.splice(0, 10);

            let description = "";
            let i = 0;

            const embed = new Discord.EmbedBuilder()
                .setTitle("/gasp leaderboard")
                .setAuthor({
                    name: client.user.username,
                    iconURL: message.guild.iconURL(),
                })
                .setColor(0x313138);
            for (const data of top10) {
                try {
                    description += `${i + 1} ${
                        client.users.cache.get(data.user).tag
                    } : ${data.xp.toLocaleString()} xp (level ${data.level})\n`;
                } catch {
                    description += `${i + 1} <@${data.user}> : ${data.xp} xp (level ${
                        data.level
                    })\n`;
                }
                i += 1;
            }
            embed.setDescription(description);
            return message.channel.send({ embeds: [embed] });
        }
    },
};
