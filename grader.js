#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = null;

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)){
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1);
  }
  return instr;
};

var cheerioHtmlFile = function(htmlfile){
  return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile){
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for (var ii in checks){
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var checkUrl = function(url, target_file){
  rest.get(url).on('complete', function(result, response){
      if (result instanceof Error){
        console.error("Error: " + response.message.toString());
      }
      else {
        fs.writeFileSync(target_file, result);
        var checkJson = checkHtmlFile(target_file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
        fs.unlinkSync(testfile);
      }
  });
};

var clone = function(fn) {
  // Workaround for commander.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};

if (require.main == module){
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_file>', 'url to check', true, URL_DEFAULT)
    .parse(process.argv);
  if (program.url == null){
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
  }
  else {
    var testfile = 'to_check.html';
    checkUrl(program.url, testfile);
  }
}
else {
  exports.checkHtmlFile = checkHtmlFile;
}
