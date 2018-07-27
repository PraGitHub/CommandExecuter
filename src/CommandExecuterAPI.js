/*

To do : 
    Implement get methods to execute commands
        The URL format :
            /Execute/command=<command>
        Response :
            JSON => {ERROR : <string>,
                    STDOUT : <string>,
                    STDERR : <string>}

Useful links :
    https://www.youtube.com/watch?v=ug-g1U1UR_w

*/

var express = require('express');
var app = express();
var helper = require(__dirname+'/HelperFunctions.js');
var httpPort = 8085;
var strHTMLPath = helper.GetHTMLFolder();

app.listen(httpPort,function(err,res){
    if(err) throw err;
    console.log('CommandExecuter @ 8085');
});

app.get('/',function(httpReq,httpRes){
    httpRes.sendFile(strHTMLPath+'/CEAPIInstructions.html');
});

app.get('/Execute/:command',function(httpReq,httpRes){
    var JSONResponse = {
        Command:httpReq.params.command,
        Error:'Nothing',
        StdOut:'Nothing',
        StdErr:'Nothing'
    };
    httpRes.send(JSONResponse);
});