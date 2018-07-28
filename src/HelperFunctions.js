var fs = require('fs');
var ChildProcess = require('child_process');
var Execute = ChildProcess.exec;
var ExecuteSync = ChildProcess.execSync;
var WatchFile = fs.watchFile;
var DeleteFile = fs.unlinkSync;

var fpReadFile = function ReadFile(strFileFullPath) {
    return fs.readFileSync(strFileFullPath);
}

var fpGetHTMLFolder = function GetHTMLFolder(){
    var strPath = __dirname;
    var strToFind = '\\';
    if(strPath.indexOf('/')>-1){
        strToFind = '/';
    }
    var strLastCharacter = strPath.substr(strPath.length-1);
    if(strLastCharacter == strToFind){
        strPath = strPath.substr(0,strPath.length-1);
    }
    strPath = strPath.substr(0,strPath.lastIndexOf(strToFind));
    strPath = strPath + '/html';
    return strPath;
}

var fpSleepMS = function SleepMS(iTimeMS){
    var iStartTime = fpGetTimeStamp();
    var iNow = fpGetTimeStamp();
    while (iNow - iStartTime <= iTimeMS) {
        iNow = fpGetTimeStamp();
    }
}

var fpGetTimeStamp = function GetTimeStamp() {
    var strTimeObj = new Date();
    var strTimeStamp = "";
    strTimeStamp = strTimeObj.getTime();
    //console.log('TimeStamp : ' + strTimeStamp);
    return strTimeStamp;
}

var fpGetStringExcludingSubStirng = function GetStringExcludingSubStirng(strString, strSubString) {
    var strToReturn = "";
    if (strString.indexOf(strSubString) != -1) {
        strToReturn = strString.substr(strSubString.length);
        //console.log('GetStringExcludingSubStirng :: strToReturn = ' + strToReturn);
    }
    return strToReturn;
    
}

var fpAppendToFile = function AppendToFile(strFileFullPath, strData) {
    if (strData != null || strData != "" || strData=="null") {
        fs.appendFileSync(strFileFullPath, strData);
        fs.appendFileSync(strFileFullPath, '\r\n');
    }
}

var fpAppendToFileWithHeader = function AppendToFileWithHeader(strFileFullPath, strData, strHeader) {
    if (strData != null || strData != "" || strData == "null") {
        fs.appendFileSync(strFileFullPath, strHeader + ' : \r\n');
        fs.appendFileSync(strFileFullPath, strData);
        fs.appendFileSync(strFileFullPath, '\r\n');
    }
}

var fpCreateDirectory = function CreateDirectory(strDirectoryFullPath) {
    fs.mkdir(strDirectoryFullPath, function (err) {
    });
}

var fpExecuteCommand = function ExecuteCommand(strCommand, strOutFile, bCreateDone = false) {
    Execute(strCommand, function (strError, strStdOut, strStdErr) {
        fpAppendToFile(strOutFile, 'Following is the result to the command - ' + '"' + strCommand + '"');
        fpAppendToFileWithHeader(strOutFile, strError, 'ERROR');
        fpAppendToFileWithHeader(strOutFile, strStdOut, 'STDOUT');
        fpAppendToFileWithHeader(strOutFile, strStdErr, 'STDERR');
        fpAppendToFile(strOutFile, '*CommandExecuterEOC*');
        if (bCreateDone == true) {
            fpAppendToFile(strOutFile + 'DONE', '');
        }
        return;
    });
}

var fpExecuteCommandUserCallback = function ExecuteCommand(strCommand,fpCallBack){
    //console.log('fpExecuteCommandOutJSON :: ');
    Execute(strCommand,fpCallBack);
}

var fpExecuteCommandSync2 = function ExecuteCommandSync(strCommand, strOutFile,bCreateDone = false) {
    var strOut = ExecuteSync(strCommand); 
    fpAppendToFileWithHeader(strOutFile,strOut, "STDOUT");
    fpAppendToFile(strOutFile, '*CommandExecuterEOC*');
    if (bCreateDone == true) {
        fpAppendToFile(strOutFile + 'DONE', '');
    }
    return;
}

var fpExecuteCommandSync = function ExecuteCommandSync(strCommand) {
    var strOutput = ExecuteSync(strCommand);
    return strOutput;
}

var fpExecuteCommandsFromFile = function ExecuteCommandsFromFile(strCommandFile, strOutFile) {
    var strCommandFileData = fpReadFile(strCommandFile);
    var strTempData = strCommandFileData.toString();
    while (true) {
        //console.log('ExecuteCommandsFromFile :: strTempData = ' + strTempData); 
        var iPos = strTempData.indexOf('\n');
        var strCommand = "";
        strCommand = strTempData.substr(0, iPos);
        if (strCommand == null || strCommand == "") {//EOF
            strCommand = strTempData;
            strTempData = "";
        }
        fpExecuteCommand(strCommand, strOutFile.toString());
        strTempData = strTempData.substr(iPos + 1);
        if (strTempData == "") {
            break;
        }
    }
}

var fpDoesFileExist = function DoesFileExist(strFileFullpath) {
    return fs.existsSync(strFileFullpath);
}

var fpConvertToHTML = function ConvertToHTML(strData) {
    var strHTMLToReturn = "";
    var strHTMLOutput = "";
    var strTempData = strData.toString();
    while (true) {
        var iPos = strTempData.indexOf('\n');
        var strLine = strTempData.substr(0, iPos);
        if (strLine == null || strLine == "") {//EOF
            break;
        }
        strHTMLOutput = strHTMLOutput + '<a>' + strLine + '</a><br/>';
        strTempData = strTempData.substr(iPos + 1);
    }
    return strHTMLOutput;
}

exports.GetStringExcludingSubStirng = fpGetStringExcludingSubStirng;
exports.ReadFile = fpReadFile;
exports.ExecuteCommand = fpExecuteCommand;
exports.ExecuteCommandSync = fpExecuteCommandSync;
exports.ExecuteCommandSyncOutToFile = fpExecuteCommandSync2;
exports.ExecuteCommand = fpExecuteCommandUserCallback;
exports.CreateDirectory = fpCreateDirectory;
exports.GetTimeStamp = fpGetTimeStamp;
exports.DoesFileExist = fpDoesFileExist;
exports.ExecuteCommandsFromFile = fpExecuteCommandsFromFile;
exports.AppendToFile = fpAppendToFile;
exports.SleepMS = fpSleepMS;
exports.WatchFile = WatchFile;
exports.DeleteFile = DeleteFile;
exports.ConvertToHTML = fpConvertToHTML;
exports.GetHTMLFolder = fpGetHTMLFolder;