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
    JSONResponse = helper.Execute(httpReq.params.command,function(strError,strStdOut,strStdErr){
        var JSONResponse = {
            Command:httpReq.params.command,
            Error:null,
            StdOut:null,
            StdErr:null
        };
        console.log(strStdOut);
        httpRes.setHeader('Content-Type', 'application/json');
        JSONResponse.Error = strError;
        JSONResponse.StdOut = strStdOut.toString('utf-8');
        JSONResponse.StdErr = strStdErr;
        //httpRes.write(JSON.stringify(JSONResponse));
        httpRes.json(JSONResponse);
        httpRes.end();
    });
});