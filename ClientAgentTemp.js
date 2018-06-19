// JavaScript source code
var express = require('express');
var bodyParser = require('body-parser');
var helper = require('./HelperFunctions');
var app = express();
var httpPort = 8086;
helper.CreateDirectory(__dirname + '/OutFiles');

app.listen(httpPort, function () {
    console.log('Client Agent is listening to ' + httpPort);
});

app.use(bodyParser.json()); //http response will be JSON formatted. The first parameter of callback function
                            //of any app.post or app.get will be JSON formatted.
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function (httpReq, httpRes) {
    httpRes.setHeader('content-type', 'text/html');
    httpRes.write('<h4>Command Executer</h4>');
    httpRes.write('<br/>');
    httpRes.write('<form method="post" action="ExecuteCommand">');
    httpRes.write('<input type="text" name="Command" placeholder="Command"/>');
    httpRes.write('<input type="submit" value="Execute"/>');
    httpRes.write('</form>');
    httpRes.end();
});

app.post('/ExecuteCommand', function (httpReq, httpRes) {
    var strCommand = httpReq.body.Command;
    var strResultFile = __dirname + '/OutFiles/CommandResult_' + helper.GetTimeStamp() + '.outfile';
    var strResultFileCE = __dirname + '/OutFiles/CEResult_' + helper.GetTimeStamp() + '.outfile';
    helper.AppendToFile(strResultFile, '');
    helper.AppendToFile(strResultFileCE, '');
    helper.ExecuteCommand('node CommandExecuter -command="' + strCommand + '" -result="' + strResultFile + '"', strResultFileCE, true);
    httpRes.setHeader('content-type', 'text/html');
    httpRes.write('<div style="right:10%;top:10%"><a href="/">Home<a/></div>')
    httpRes.write('<br/><br/>');
    httpRes.write('Executing the command "' + strCommand + '" ...');
    httpRes.write('<br/><br/>');

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
                httpRes.write('Following Error was encountered in spawning CommandExecuter');
                httpRes.write('<br/><br/>');
                httpRes.write(helper.ConvertToHTML(strError));
                httpRes.write('<br/><br/>');
                httpRes.end();
                helper.DeleteFile(strResultFile + 'DONE');
                helper.DeleteFile(strResultFileCE + 'DONE');
                return;
            }
            if (helper.DoesFileExist(strResultFile + 'DONE')) {
                var strResult = helper.ReadFile(strResultFile);
                httpRes.write(helper.ConvertToHTML(strResult));
                httpRes.end();
                helper.DeleteFile(strResultFile + 'DONE');
                helper.DeleteFile(strResultFileCE + 'DONE');
                return;
            }
        }
    });
});

