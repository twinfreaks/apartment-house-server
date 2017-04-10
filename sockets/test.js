module.exports = function (io) {
   io.on('connection', function(socket){
       console.log("***** WS connection test *****");
   });
};