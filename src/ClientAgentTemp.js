// JavaScript source code
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var helper = require('./HelperFunctions');
var app = express();
var httpPort = '';
var apiPort = '';
var strHTMLPath = helper.GetHTMLFolder();
helper.CreateDirectory(__dirname + '/OutFiles');

if(process.argv.length>2){
    for(let i=2;i<process.argv.length;i++){
        var strArg = process.argv[i];
        if(httpPort == ''){
            httpPort = helper.GetStringExcludingSubStirng(strArg,'-port=');
        }
        if(apiPort == ''){
            apiPort = helper.GetStringExcludingSubStirng(strArg,'-apiport=');
        }
    }
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
    var strURL = 'http://localhost:'+apiPort+'/execute/';
    var strCommand = httpReq.body.Command;
    var strEncodedCommand = helper.EncodeURL(strCommand);
    //console.log('strEncodedCommand = ',strEncodedCommand);
    strURL = strURL + strEncodedCommand;
    //console.log('strURL = ',strURL);
    request(strURL,function(err,res,body){
        if(err){
            httpRes.write('<div class="alert alert-danger">');
            httpRes.write('Problem with CommandExecuterAPI');
            httpRes.end();
            return;
        }
        var JSONBody = JSON.parse(body);
        //console.log(JSONBody);
        var strOutput = '<strong>Command :</strong> <br>';
        strOutput = strOutput.concat(helper.ConvertToHTML(JSONBody.Command));
        strOutput = strOutput.concat('<br>');
        strOutput = strOutput.concat('<strong>Error :</strong> <br>');
        if(JSONBody.StdOut == null || JSONBody.StdOut == ''){
            var strErrOut = JSON.stringify(JSONBody.Error);
            strOutput = strOutput.concat(helper.ConvertToHTML(strErrOut));
        }
        else{
            strOutput = strOutput.concat(helper.ConvertToHTML('null'));
        }
        strOutput = strOutput.concat('<br>');
        strOutput = strOutput.concat('<strong>STDOUT :</strong> <br>');
        strOutput = strOutput.concat(helper.ConvertToHTML(JSONBody.StdOut));
        strOutput = strOutput.concat('<br>');
        strOutput = strOutput.concat('<strong>STDERR :</strong> <br>');
        if(JSONBody.StdErr!=null){
            strOutput = strOutput.concat(helper.ConvertToHTML(JSONBody.StdErr));
            strOutput = strOutput.concat('<br>');
        }
        //console.log(strOutput);
        httpRes.write('<div class="alert alert-success">');
        httpRes.write(strOutput);
        httpRes.write('</div>');
        httpRes.end();
    });
}