module.exports = {
    name: "pic",
    aliases: ["pp"],
    description: "Gives a user the pic role",
    usage: "pic <user>",
    run: (client, message, args) => {
        if (!message.member.permissions.toArray().includes("ManageMessages")) return;

        let mem = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mem) return message.channel.send("Please provide a valid user");

        let role = message.guild.roles.cache.find((r) => r.name === "pic");

        if (mem.roles.cache.has(role.id)) {
            mem.roles
                .remove(role.id)
                .then(() => {
                    message.channel.send("removed pic perms");
                })
                .catch((err) => {
                    message.channel.send("error removing pic perms");
                });
        } else {
            mem.roles
                .add(role)
                .then(() => {
                    message.channel.send("added pic perms");
                })
                .catch((err) => {
                    message.channel.send("error adding pic perms");
                });
        }
    },
};
