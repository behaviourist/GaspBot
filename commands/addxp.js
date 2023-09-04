module.exports = {
    name: "xp",
    aliases: [],
    description: "Commands to edit user xp",
    usage: "xp <add/deduct/set/reset> <user> <amount>",
    run: (client, message, args) => {
        if (message.author.id !== "868088900185362503") return;

        if (!["add", "deduct", "set", "reset"].includes(args[0]) || !args[1] || !args[2])
            return message.channel.send(`Please provide valid arguments: ${module.exports.usage}`);

        if (!message.mentions.users.first()) return message.channel.send("Please mention a user.");
        if (!args[2]) return message.channel.send("Please provide a valid amount of xp.");

        let xp = parseInt(args[2]);

        if (args[0] === "add") {
            let levelFromXP = Math.ceil((-1 + Math.sqrt(1 + (8 * xp) / 350)) / 2);

            client.levels.math(
                `${message.guild.id}-${message.mentions.users.first().id}`,
                "+",
                levelFromXP,
                "level"
            );

            client.levels.math(
                `${message.guild.id}-${message.mentions.users.first().id}`,
                "+",
                xp,
                "xp"
            );

            return message.channel.send(
                `Gave ${message.mentions.users.first()} ${xp} xp. They are now level ${client.levels.get(
                    `${message.guild.id}-${message.mentions.users.first().id}`,
                    "level"
                )}.`
            );
        } else if (args[0] === "deduct") {
            let newXp =
                client.levels.get(
                    `${message.guild.id}-${message.mentions.users.first().id}`,
                    "xp"
                ) - xpToGive;

            client.levels.set(
                `${message.guild.id}-${message.mentions.users.first().id}`,
                newXp,
                "xp"
            );

            let levelFromXP = Math.ceil((-1 + Math.sqrt(1 + (8 * newXp) / 350)) / 2);

            client.levels.set(
                `${message.guild.id}-${message.mentions.users.first().id}`,
                levelFromXP,
                "level"
            );

            return message.channel.send(
                `Took ${xpToTake} xp from ${message.mentions.users.first()}. They are now level ${client.levels.get(
                    `${message.guild.id}-${message.mentions.users.first().id}`,
                    "level"
                )}.`
            );
        } else if (args[0] === "set") {
            let levelFromXP = Math.ceil((-1 + Math.sqrt(1 + (8 * xp) / 350)) / 2);

            client.levels.set(`${message.guild.id}-${message.mentions.users.first().id}`, xp, "xp");
            client.levels.set(
                `${message.guild.id}-${message.mentions.users.first().id}`,
                levelFromXP,
                "level"
            );

            return message.channel.send(
                `Set ${message.mentions.users.first()}'s xp to ${xp}. They are now level ${levelFromXP}.`
            );
        } else if (args[0] === "reset") {
            client.levels.set(`${message.guild.id}-${message.mentions.users.first().id}`, 0, "xp");
            client.levels.set(
                `${message.guild.id}-${message.mentions.users.first().id}`,
                0,
                "level"
            );

            return message.channel.send(`Reset ${message.mentions.users.first()}'s xp.`);
        } else {
            return message.channel.send(`Please provide a valid option. ${module.exports.usage}`);
        }
    },
};
