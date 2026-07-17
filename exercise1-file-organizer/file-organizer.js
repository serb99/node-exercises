const fs = require('node:fs/promises');

async function getFiles(){
    try{
        // Filter the files in the input folder and return only the files (not directories)
        const entries = await fs.readdir('./input', {withFileTypes: true});
        const files = entries.filter(entry => entry.isFile())
        return files;
    } catch (err){
        console.error(err);
        return [];
    }
}

function getExtension(fileName){
    if(!fileName.includes('.')) return '';
    if(fileName.startsWith('.')) return '';

    const parts = fileName.split('.');

    return parts[parts.length - 1];
}

async function createFolder(outputFolder, extension){
    try {
        await fs.mkdir(`./${outputFolder}/${extension}`, {recursive: true});
    } catch (err) {
        console.error(err);
    }
}

(async function fileOrganizer(){
    const files = await getFiles();
    
    for(const file of files){
        const extension = getExtension(file.name);
        if(!extension) continue;
        await createFolder('output', extension);
        await fs.rename(`./input/${file.name}`, `./output/${extension}/${file.name}`);
    }
})();
