const fs = require('fs');
const path = require('path');

const tokenPath = process.argv[2];
var credentials = require(tokenPath)

const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({projectId: credentials.project_id, credentials});
// const __dirname = path.resolve();
// translatte('Do you speak Russian?', {to: 'ru'}).then(res => {
//     console.log(res.text);
// }).catch(err => {
//     console.error(err);
// });
var enLocation = __dirname + '/src/en/messages.json';
localesLocation = __dirname + '/src/_locales/';

// var fullList = [
//     'am', 'ar', 'bg', 'bn', 'ca',
//     'cs', 'da', 'de', 'el',
//     'en_GB', 'en_US', 'es', 'es_419', 'et',
//     'fa', 'fi', 'fil', 'fr', 'gu',
//     'he', 'hi', 'hr', 'hu', 'id',
//     'it', 'ja', 'kn', 'ko', 'lt',
//     'lv', 'ml', 'mr', 'ms', 'nl',
//     'no', 'pl', 'pt_BR', 'pt_PT', 'ro',
//     'ru', 'sk', 'sl', 'sr', 'sv',
//     'sw', 'ta', 'te', 'th', 'tr',
//     'uk', 'vi', 'zh_CN', 'zh_TW'
// ]
var langs2translate = [
    'uk', 'ru',
    'am', 'ar', 'bg', 'bn', 'ca',
    'cs', 'da', 'de', 'el',
    'es', 'et',
    'fa', 'fi', 'fr', 'gu',
    'he', 'hi', 'hr', 'hu', 'id',
    'it', 'ja', 'kn', 'ko', 'lt',
    'lv', 'ml', 'mr', 'ms', 'nl',
    'no', 'pl', 'ro',
    'sk', 'sl', 'sr', 'sv',
    'sw', 'ta', 'te', 'th', 'tr',
    'vi',
]
var uniqueLangs2Translate = {
    'zh_CN': 'zh-cn',
    'zh_TW': 'zh-tw',
    'pt_BR': 'pt',
    'pt_PT': 'pt',
    'en_GB': 'en',
    'en_US': 'en',
    'es_419': 'es',
    'fil': 'tl'
}

// cleaning directories
deleteFolderRecursive(localesLocation)
fs.mkdirSync(localesLocation)

// read initial english
var json = readJSON(enLocation);

init()

async function init() {
    for (var j = langs2translate.length - 1; j >= 0; j--) {
        var translatedJSON = await translateJSON(json, langs2translate[j]);
        storeLang(langs2translate[j], translatedJSON)
    }
    for (var j in uniqueLangs2Translate) {
    	if(uniqueLangs2Translate[j] == 'en'){
    		storeLang(j, json)
    	}else{
	        var translatedJSON = await translateJSON(json, uniqueLangs2Translate[j]);
	        storeLang(j, translatedJSON)
    	}
    }


    // copy en locale
    storeLang('en', json)
}





async function translateJSON(initialJSON, lang) {
    var jsonToWrite = JSON.parse(JSON.stringify(initialJSON));
    for (var i in json) {
        jsonToWrite[i].message = await translateFromEng(json[i].message, lang)
    }
    return jsonToWrite;
}

function storeLang(langName, json) {
    var langPath = localesLocation + langName;
    fs.mkdirSync(langPath)

    writeJSON(langPath + '/messages.json', json)

    console.log(langName + ' => successfully stored!');
}


function readJSON(location) {
    var data = fs.readFileSync(location, 'utf8')
    var json = JSON.parse(data)
    return json;
}



function translateFromEng(txt, lang) {
    return translate.translate(txt, lang).then(res => {
        const [translation] = res;
        return translation;
    }).catch(err => {
        console.log(err)
        return err;
    });
}




function writeJSON(fileName, json) {
    fs.writeFile(fileName, JSON.stringify(json, null, 4), function(err) {
        if (err) return console.log(err);
    });
}


// fs.mkdirSync(localesLocation+'dddd');

function deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
};




// const getDirectories = source =>
//     fs.readdirSync(source, { withFileTypes: true })
//     .filter(dirent => dirent.isDirectory())
//     .map(dirent => dirent.name)

// var list = getDirectories(__dirname + '/src/_locales');


// console.log(list)



// write jsons