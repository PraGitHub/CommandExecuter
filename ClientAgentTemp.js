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
    httpRes.sendFile(__dirname+'/ClientAgentHome.html');
});

app.post('/ExecuteCommand', function (httpReq, httpRes) {
    var strCommand = httpReq.body.Command;
    var strResultFile = __dirname + '/OutFiles/CommandResult_' + helper.GetTimeStamp() + '.outfile';
    var strResultFileCE = __dirname + '/OutFiles/CEResult_' + helper.GetTimeStamp() + '.outfile';
    helper.AppendToFile(strResultFile, '');
    helper.AppendToFile(strResultFileCE, '');
    helper.ExecuteCommand('node CommandExecuter -command="' + strCommand + '" -result="' + strResultFile + '"', strResultFileCE, true);
    httpRes.write(helper.ReadFile(__dirname+'/CommandResult.html').toString());
    httpRes.write('<div class="alert alert-info"><strong>')
    httpRes.write('Executing the command "' + strCommand + '" ...');
    httpRes.write('</strong></div>');

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
                httpRes.write('<div class="alert alert-success"><strong>');
                httpRes.write(helper.ConvertToHTML(strResult));
                httpRes.end();
                helper.DeleteFile(strResultFile + 'DONE');
                helper.DeleteFile(strResultFileCE + 'DONE');
                return;
            }
        }
    });
});

