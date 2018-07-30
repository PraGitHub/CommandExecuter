// JavaScript source code
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var helper = require('./HelperFunctions');
var app = express();
var httpPort;
var strHTMLPath = helper.GetHTMLFolder();
helper.CreateDirectory(__dirname + '/OutFiles');

if(process.argv.length>2){
    var strArg = process.argv[2];
    httpPort = helper.GetStringExcludingSubStirng(strArg,'-port=');
}

if(httpPort == ''){
    httpPort = 8086;
}

app.listen(httpPort, function () {
    console.log('Client Agent is listening to ' + httpPort);
});

app.use(bodyParser.json()); //http request will be JSON formatted. The first parameter of callback function
                            //of any app.post or app.get will be JSON formatted.
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function (httpReq, httpRes) {
    httpRes.sendFile(strHTMLPath+'/ClientAgentHome.html');
});

app.post('/ExecuteCommand', function (httpReq, httpRes) {
    httpRes.write(helper.ReadFile(strHTMLPath+'/CommandResult.html').toString());
    httpRes.write('<div class="alert alert-info"><strong>')
    httpRes.write('Executing the command "' + httpReq.body.Command + '" ...');
    httpRes.write('</strong></div>');
    if(httpReq.body.Mode == '0'){
        CommandLineMethod(httpReq,httpRes);
    }
    else{
        APIMethod(httpReq,httpRes);
    }
});

function CommandLineMethod(httpReq,httpRes){
    var strCommand = httpReq.body.Command;
    var strResultFile = __dirname + '/OutFiles/CommandResult_' + helper.GetTimeStamp() + '.outfile';
    var strResultFileCE = __dirname + '/OutFiles/CEResult_' + helper.GetTimeStamp() + '.outfile';
    helper.AppendToFile(strResultFile, '');
    helper.AppendToFile(strResultFileCE, '');
    helper.ExecuteCommand('node CommandExecuter -command="' + strCommand + '" -result="' + strResultFile + '"', strResultFileCE, true);

    helper.WatchFile(strResultFileCE + 'DONE', function (currentStatus, previousStatus) {
        if (currentStatus.mode > previousStatus.mode) {
            var strTemp = helper.ReadFile(strResultFileCE).toString();
            var iPosSTDOUTBegin = 0;
            var iPosErrorEnd = 0;
            var strError;
            iPosSTDOUTBegin = strTemp.toString().indexOf('STDOUT :');
            iPosErrorEnd = strTemp.indexOf('ERROR : ') + 10;
            strError = strTemp.substr(iPosErrorEnd, (iPosSTDOUTBegin - iPosErrorEnd));
            //console.log('ClientAgent::strError = ' + strError);
            if (strError.indexOf('null') == -1) {
                httpRes.write('<div class="alert alert-danger"><strong>');
                httpRes.write('Following Error was encountered in spawning CommandExecuter');
                httpRes.write('</strong></div>');
                httpRes.write('<pre>');
                httpRes.write('<div class="alert alert-danger"><strong>');
                httpRes.write(helper.ConvertToHTML(strError));
                httpRes.write('</strong></div>');
                httpRes.write('<pre/>');
                httpRes.write('<br/><br/>');
                httpRes.end();
                helper.DeleteFile(strResultFile + 'DONE');
                helper.DeleteFile(strResultFileCE + 'DONE');
                return;
            }
            if (helper.DoesFileExist(strResultFile + 'DONE')) {
                var strResult = helper.ReadFile(strResultFile);
                httpRes.write('<div class="alert alert-success">');
                httpRes.write(helper.ConvertToHTML(strResult.toString()));
                httpRes.end();
                helper.DeleteFile(strResultFile + 'DONE');
                helper.DeleteFile(strResultFileCE + 'DONE');
                return;
            }
        }
    });
}

function APIMethod(httpReq,httpRes){
    request('http://localhost:8087/execute/ipconfig',function(err,res,body){
        var JSONBody = JSON.parse(body);
        console.log(JSONBody.StdOut);
        //httpRes.write(helper.ConvertToHTML(body.StdOut));
        //Need to complete this method
    });
}