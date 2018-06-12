var fs = require('fs');
var ChildProcess = require('child_process');
var Execute = ChildProcess.exec;

var fpReadFile = function ReadFile(strFileFullPath) {
    return fs.readFileSync(strFileFullPath);
}

var fpGetTimeStamp = function GetTimeStamp() {
    var strTimeObj = new Date();
    var strTimeStamp = "";
    strTimeStamp = strTimeObj.getTime();
    console.log('TimeStamp : ' + strTimeStamp);
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

var fpExecuteCommand = function ExecuteCommand(strCommand, strOutFile) {
    Execute(strCommand, function (strError, strStdOut, strStdErr) {
        fpAppendToFile(strOutFile, 'Following is the result to the command - ' + '"' + strCommand + '"');
        fpAppendToFileWithHeader(strOutFile, strError, 'Error');
        fpAppendToFileWithHeader(strOutFile, strStdOut, 'STDOUT');
        fpAppendToFileWithHeader(strOutFile, strStdErr, 'STDERR');
        return;
    });
}

var fpExecuteCommandsFromFile = function ExecuteCommandsFromFile(strCommandFile, strOutFile) {
    var strCommandFileData = fpReadFile(strCommandFile);
    var strTempData = strCommandFileData.toString();
    while (true) {
        console.log('ExecuteCommandsFromFile :: strTempData = ' + strTempData); 
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

exports.GetStringExcludingSubStirng = fpGetStringExcludingSubStirng;
exports.ReadFile = fpReadFile;
exports.ExecuteCommand = fpExecuteCommand;
exports.CreateDirectory = fpCreateDirectory;
exports.GetTimeStamp = fpGetTimeStamp;
exports.DoesFileExist = fpDoesFileExist;
exports.ExecuteCommandsFromFile = fpExecuteCommandsFromFile;