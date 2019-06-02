UserConfig = {
    Express: {
        Enabled: true,
        Port: 6557,
        Whitelist: {
            Enable: false,
            IPs: ["127.0.0.1"]
        }
    },

    MongoDB: {
        Enabled: true,
        Url: "mongodb://localhost:27017",
        DatabaseName: "SimpleBot_DB"
    },

    WebSocket: {
        Enabled: true,
        Port: 7845
    }
};

module.exports = UserConfig;