// JavaScript source code
var helper = require('./HelperFunctions');
var iArguments = process.argv.length;
var strInFile = "";
var strCommand = "";
var iArguments = process.argv.length
var strTimeStamp = helper.GetTimeStamp();
var strOutFile = "";
//console.log(process.argv);
for (let i = 0; i < iArguments; i++) {
    var strArgument = process.argv[i];
    //console.log(i + ' - ' + strArgument);
    if ((strArgument.indexOf('-help') != -1) || (strArgument.indexOf('-?') != -1)) {
        var strTempFile = helper.ReadFile(__dirname + '/Help.help');
        console.log(strTempFile.toString());
        return;
    }
    if (strInFile == "") {
        strInFile = helper.GetStringExcludingSubStirng(strArgument, '-file=');
    }
    if (strCommand == "") {
        strCommand = helper.GetStringExcludingSubStirng(strArgument, '-command=');
    }
    if (strOutFile == "") {
        strOutFile = helper.GetStringExcludingSubStirng(strArgument, '-result=');
    }
}

if (strOutFile == "") {
    helper.CreateDirectory(__dirname + '/OutFiles');
    strOutFile = __dirname + '/OutFiles/' + strTimeStamp + '.outfile';
}

console.log('strInFile = ' + strInFile);
console.log('strCommand = ' + strCommand);
console.log('strOutFile = ' + strOutFile);

if (strCommand != "") {
    helper.ExecuteCommand(strCommand, strOutFile);
}

if (helper.DoesFileExist(strInFile) == true) {
    helper.ExecuteCommandsFromFile(strInFile,strOutFile);
}