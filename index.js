// LogXYZ
const LogXYZ = require('logxyz');
const Log = new LogXYZ({_Type: LogXYZ.StorageType().ConsoleOnly, _Connection: null}, {_appName: "SimpleBot"});

// Events
const Events = require('events');

// Discord.js
const Discord = require('discord.js');

// Load the Configuration [TODO] Must Change ASAP
// try {
//     const DiscordCreds = require("./Configs/discord_credentials");
//     const UserConfiguration = require("./Configs/user_configuration");
// } catch (error) {
//     // Configs have not been added
//     Log.Log({Namespace: "SimpleBot_Init", Info: "One or more configuration files failed to load"});
//     Log.Log({Namespace: "SYSTEM PANIC", Info: "Failed to Init................................"});
//     Log.Log({Namespace: "SYSTEM PANIC", Info: "SYSTEM ABORTING\n\n\n\n\t\t\t\t\t\t\tREAD ERROR LOGS FOR INFO\n\n"});
//     process.exit(1);
// }

// Optional: WebSockets for Electron/Express UI
try {
    const wss = require('ws');
} catch (error) {
    // WebSocket has not been added
    Log.Log({Namespace: "SimpleBot_Init", Info: "WebSocket Features are disabled"});
}

// Optional: WebServer for hosting the API
try {
    // Load Express
    const express = require('express');
    // Init Class
    const app = express();
    // Load Routes
    const API_Route = require('./Routes/api');
    // Apply Routes
    app.use('/api', API_Route);
    // Apply Static Routing
    app.use(express.static("./Views/"));
} catch (error) {
    // MongoDB has not been added
    Log.Log({Namespace: "SimpleBot_Init", Info: "The Web Dashboard Features are disabled"});
}

// Optional: MongoDB for access to full suite of features
try {
    const MongoDB = require('mongodb');
} catch (error) {
    // MongoDB has not been added
    Log.Log({Namespace: "SimpleBot_Init", Info: "MongoDB Features are disabled"});
}


class SimpleBot extends Events {
    constructor(_Discord_Token = "Discord_Token_Here", _Settings = { "Prefix": ">" })
    {
        // Super for Events extension
        super();
        this._Settings = (_Settings == null || _Settings == undefined) ? null : _Settings;
        this._Discord_Token = (_Discord_Token == null || _Discord_Token == undefined) ? null : _Discord_Token;
        // Run Settings Checks
        this.SettingsCheck();
        // Run System Checks
        this.SystemCheck();
        // Run Init of Client
        this.Init();
    }

    // Called Internally
    // Handles unpopulated settings
    SettingsCheck()
    {
        if(this._Settings == null)
        {
            // Populate the default settings
            this._Settings = {};
            this._Settings.Prefix = ">";
            Log.Log({Namespace: "Settings_Check", Info: "No settings specified, populating defaults"});
        }

        if(this._Discord_Token == null)
        {
            // Unable to Start
            Log.Log({Namespace: "SimpleBot_Init", Info: "No Discord Token Present, Unable to Start......."});
            Log.Log({Namespace: "SimpleBot_Init", Info: "Exiting........................................."});
            process.exit(1);
        }

        Log.Log({Namespace: "Settings_Check", Info: "Completed Check!"});
    }

    // Ran on a instance of the class being created
    // Checks dependencies
    SystemCheck()
    {
        const dep = require('./package.json').dependencies;
        const opt = require('./package.json').optionalDependencies;
        // Consume to one array
        let installedDeps = [];
        for (const deps in dep) {
            installedDeps.push(deps);
        }
        for (const deps in opt) {
            installedDeps.push("[opt]" + deps);
        }
        Log.Log({Namespace: "System Check", Info: `Currently installed Dependencies: ${installedDeps}`});
        // Check if deps are running
        // To be Coded [TODO]
        Log.Log({Namespace: "System_Check", Info: "Completed Check!"});
    }

    // Ran on a instance of the class being created
    // Logs the bot into Discord
    Init()
    {
        // Create instance of class
        this.DiscordClient = new Discord.Client();
        // Create a new instance of Collections
        this.DiscordClient.commands = new Discord.Collection();
        // Set the handlers
        this.DiscordClient.on("ready", this.InternalHandleReady.bind(this));
        this.DiscordClient.on("message", this.InternalHandleMessage.bind(this));
        this.DiscordClient.on("userUpdate", this.InternalUserUpdate.bind(this));
        this.DiscordClient.on("guildUpdate", this.InternalGuildUpdate.bind(this));
        this.DiscordClient.on("guildBanAdd", this.InternalGuildBan.bind(this));
        this.DiscordClient.on("messageDelete", this.InternalMessageDelete.bind(this));
        this.DiscordClient.on("messageDeleteBulk", this.InternalMessageDelete.bind(this));

        Log.Log({Namespace: "Init", Info: "Completed Initialization!"});
    }

    // Called by the User
    // Logs the client into discord
    Login()
    {
        // Login
        this.DiscordClient.login(this._Discord_Token);
        Log.Log({Namespace: "Login", Info: "Logging into Discord..."});
        return true;
    }


    // Called by the user
    // Adds a Command to the Command Collection
    AddCommand(name = "", fn = function(){})
    {
        // Check if Init has been ran
        if(this.DiscordClient == undefined || this.DiscordClient == null)
        {
            // Init has not been ran
            return false;
        }

        // Check if a name has been set
        if(name == "")
        {
            // No Command
            return false;
        }

        try {
            // Consume the command
            this.DiscordClient.commands.set(name, fn);
            Log.Log({Namespace: "AddCommand", Info: `Successfully added command: ${name}`});
            return true;
        } catch (error) {
            Log.Log({Namespace: "AddCommand", Info: `Unable to add command: ${name}`});
            return false;
        }
    }

    // Internal Functions // [TODO]

    // Called Internally
    InternalHandleReady()
    {
        Log.Log({Namespace: "Discord.js", Info: `Logged into Discord as ${this.DiscordClient.user.tag}`});
    }

    // Called Internally
    InternalHandleMessage(message)
    {
        // Log the message that was received {all messages}
        Log.Log({Namespace: "Message_In", Info: `Message from ${message.author.tag} reading ${message.content}`});
        // Ignore Bot Messages for command detection
        if(message.author.id == this.DiscordClient.user.id) return;
        // Handle the messages with the prefix set by the user
        if(String(message).substr(0,1) == this._Settings.Prefix)
        {
            // `Caught` a bot command
            // Splice the command from the string
            let commandString = String(message.content).substring(1, String(message.content).length);
            let params = String(commandString).split(" ");
            let command = params.shift();
            Log.Log({Namespace: "Command_In", Info: `Command Received: ${commandString}`});
            Log.Log({Namespace: "Command_In", Info: `Command Parameters: ${params}`});
            // Check for command matches with any definitions
            // ...... [TODO]
            if(this.DiscordClient.commands.get(command))
            {
                // Command found in the collections
                this.DiscordClient.commands.get(command)(message);
                Log.Log({Namespace: "Message_In", Info: `Command: ${command} was executed`});
            }
            else
            {
                Log.Log({Namespace: "Message_In", Info: `Command: ${command} not found`});
                message.reply("Sorry that command does not exist :P");
            }
        }
    }

    // Called Internally
    // Handles changes to users regardless of guild
    InternalUserUpdate(old, newU)
    {
        
    }

    // Called Internally
    // Handles changes to the guild in Discord
    InternalGuildUpdate(old, newG)
    {

    }

    // Called Internally
    // Handles ban related events in discord
    InternalGuildBan(guild, user)
    {
        
    }

    // Called Internally
    // Handles Messages that are deleted in discord
    InternalMessageDelete(msgDeleted)
    {
        // Check the type [TODO]
        if(msgDeleted.content)
        {
            // This is a single message
            Log.Log({Namespace: "Message_Delete_Event", Info: `Message -> ${msgDeleted.content} <- has been deleted`});
        }
        else
        {
            // Assume this is a `Collection`
            console.log("Collection")
        }
    }
}

module.exports = SimpleBot;