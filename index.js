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
    let fileList = await readRecursive(folderpath);
    let files = await Promise.all(
        fileList.map(async f => {
            let fStat = await readFile(f);

            // console.log(fStat);

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

    if (targetFolder !== undefined) {
        let files = await getAllFilesInDirectory(targetFolder);
        let duplicates = checkForDuplicates(files);
        
        duplicates.map(d => {
            console.log(d);
        });
    } else {
        console.log('No folder specified.');
    }
})();
