const Discord = require("discord.js");

module.exports = {
    name: "userinfo",
    description: "Get info about a user!",
    aliases: ["ui"],
    run: async (client, message, args) => {
        const user =
            message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
        if (!user) return message.channel.send("Please provide a valid user!");

        const member = message.guild.members.cache.get(user.id);

        let xpbar = "";
        const userLevel = client.db.get(user.id, "level");
        const userXp = client.db.get(user.id, "xp");
        const xpNeeded = userLevel * 1000;
        const xpPercent = (userXp / xpNeeded) * 10;
        for (let i = 0; i < 10; i++) {
            if (i < xpPercent) {
                xpbar += "🟢";
            } else {
                xpbar += "🔴";
            }
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${user.username}'s info`)
            .setThumbnail(user.displayAvatarURL())
            .setFields([
                {
                    name: "User",
                    value: `${user.username}#${user.discriminator}`,
                },
                {
                    name: "ID",
                    value: user.id,
                },
                {
                    name: "Nickname",
                    value: member.nickname || "User has no nickname",
                },
                {
                    name: "Roles",
                    value:
                        member.roles.cache.length > 10
                            ? "Too many roles to display!"
                            : member.roles.cache
                                  .filter((r) => r.name !== "@everyone")
                                  .map((r) => r.name).length === 0
                            ? "User has no roles"
                            : member.roles.cache
                                  .join(", ")
                                  .filter((r) => r.name !== "@everyone")
                                  .map((r) => r.name),
                },
                {
                    name: "Nitro Boosting",
                    value: member.premiumSince
                        ? `Since ${member.premiumSince}`
                        : "User is not boosting the server",
                },
                {
                    name: "Level",
                    value:
                        `${userLevel} - ${xpbar} | ${userXp}/${xpNeeded} (${Math.round(
                            xpPercent * 10,
                            2
                        )}%)` || "0",
                },
            ]);

        message.channel.send({ embeds: [embed] });
    },
};
