module.exports = {
    name: "add",
    description: "add!",
    aliases: ["a"],
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send("Please provide a number to add!");
        if (isNaN(args[0])) return message.channel.send("Please provide a valid number!");

        const number = parseInt(args[0]);

        if (client.db.get("totalNumber") === undefined) client.db.set("totalNumber", 0);

        client.db.math("totalNumber", "add", number);

        message.channel.send(
            `Added ${number} to the total number! The total number is now ${client.db.get(
                "totalNumber"
            )}`
        );
    },
};
