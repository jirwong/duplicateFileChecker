let rec = require('recursive-readdir');
let fs = require('fs');
let path = require('path');

function readRecursive(fPath) {
    return new Promise((resolve, reject) => {
        rec(fPath, (err, files) => {
            if (err) {
                reject(err);
            }

            resolve(files);
        });
    });
}

function readFile(targetFile) {
    return new Promise((resolve, reject) => {
        fs.stat(targetFile, (err, stats) => {
            if (err) {
                reject(err);
            }

            resolve(stats);
        });
    });
}

async function getAllFilesInDirectory(folderpath) {
    //console.log('reading from folderpath : ', folderpath);
    let fileList = await readRecursive(folderpath);
    //console.log('read recursively - ' + fileList.length);

    let files = await Promise.all(
        fileList.map(async f => {
            let fStat = await readFile(f);
            //console.log(fStat);
            return {
                filepath: f,
                filename: path.basename(f),
                size: fStat.size,
                birthtime: fStat.birthtime
            };
        })
    );

    return files;
}

function checkForDuplicates(files) {
    let duplicatedFiles = [];

    //console.log('checking for duplicates...');

    files.map(file => {
        let filteredList = files.filter(f => f.filepath !== file.filepath);

        filteredList.map(f => {
            if (f.filename === file.filename && f.size == file.size) {
                duplicatedFiles.push([
                    { filename: f.filename, size: f.size, filepath: f.filepath, birthtime: f.birthtime },
                    { filename: file.filename, size: file.size, filepath: file.filepath, birthtime: file.birthtime }
                ]);
            }
        });
    });

    return duplicatedFiles;
}

(async () => {
    let args = process.argv.slice(2);

    let targetFolder = args[0];
    let targetOutputFile = args[1] !== undefined ? args[1] : 'duplicate.out';

    console.log('writing results to target file - ' + targetOutputFile);

    if (targetFolder !== undefined) {
        let files = await getAllFilesInDirectory(targetFolder);
        let duplicates = checkForDuplicates(files);

        let results = { total: duplicates.length, duplicates };

        fs.writeFileSync(targetOutputFile, JSON.stringify(results));

        /*duplicates.map(d => {
            console.log(d);
        });*/

    } else {
        console.log('No folder specified.');
    }
})();
