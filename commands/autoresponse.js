module.exports = {
    name: "autoresponse",
    aliases: ["ar"],
    description: "Adds an autoresponse",
    usage: "autoresponse <trigger> <response>",
    run: (client, message, args) => {
        if (!message.member.permissions.toArray().includes("ManageMessages"))
            return message.channel.send("You do not have permission to use this command!");

        if (args[0] === "add") {
            if (!args[1]) return message.channel.send("Please provide a trigger");
            if (!args[2]) return message.channel.send("Please provide a response");

            let trigger = args[1];
            let response = args.slice(2).join(" ");

            client.autoresponse.set(message.guild.id, response, `responses.${trigger}`);

            message.channel.send(`Added autoresponse for ${trigger}`);
        } else {
            if (!args[1]) return message.channel.send("Please provide a trigger");

            let trigger = args[1];

            client.autoresponse.delete(message.guild.id, `responses.${trigger}`);

            message.channel.send(`Removed autoresponse for ${trigger}`);
        }
    },
};
