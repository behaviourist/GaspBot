module.exports = {
    name: "serverbanner",
    aliases: ["sbanner"],
    description: "Shows the server banner",
    usage: "serverbanner",
    run: (client, message, args) => {
        message.channel.send(message.guild.bannerURL({ size: 4096 }));
    },
};
