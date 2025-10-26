/*
 * Main Javascript file for my_flask_app.
 *
 * This file bundles all of your javascript together using webpack.
 */

// JavaScript modules
require("@fortawesome/fontawesome-free");
require("jquery");
require("bootstrap");

require.context(
  "../img", // context folder
  true, // include subdirectories
  /.*/, // RegExp
);

// Your own code
require("./plugins");
require("./script");
require("./socket_js/client_init");
require("./socket_js/client_join_create_room");
require("./socket_js/client_room_shout");
