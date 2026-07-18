const fs = require('node:fs/promises');

async function openLogFile(fileName){
    try{
        const fileHandle = await fs.open(`${fileName}`, 'r');
        return fileHandle;
    }
    catch(error){
        throw new Error(`Could not open log file: ${fileName}. ${error.message}`);
    }
}

async function parseLogFile(fileName, level){
    let fileHandle;

    try{
        fileHandle = await openLogFile(fileName);
        // Create the async iterator object to read the file line by line
        const lineReader = fileHandle.readLines();
        const outputFile = `./output-${level}.log`;
        const summary = {
            INFO: 0,
            WARNING: 0,
            ERROR: 0,
            total:0
        };

        await fs.writeFile(outputFile, '');

        for await (const line of lineReader){
            const parts = line.split(' ');
            const lineLevel = parts[2];

            summary.total++;

            if (summary[lineLevel] !== undefined) {
                summary[lineLevel]++;
            }
            if(lineLevel === level){
                await fs.appendFile(outputFile, line + '\n');
            }
        }
        return summary;
    }
    finally{
        if (fileHandle)  await fileHandle.close();
    }
}

(async function main(){
    const fileName = process.argv[2];
    const level = process.argv[3];

    if (!fileName || !level) {
        console.error('Usage: node log-parser.js <log_file> <log_level>');
        process.exit(1);
    }

    try{
        const summary = await parseLogFile(fileName, level);

        console.log(`Filter:        ${level}`)
        console.log(`Total lines:   ${summary.total}`)
        console.log(`INFO:          ${summary.INFO}`)
        console.log(`WARNING:       ${summary.WARNING}`)
        console.log(`ERROR:         ${summary.ERROR}`)
        console.log(`Matched:       ${summary[level]}`)
        console.log(`Output saved:  ./output-${level}.log`)
        console.log(`===================\n`)
    }catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
})();