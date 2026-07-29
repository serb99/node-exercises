const fs = require('node:fs/promises');

async function openLogFile(fileName){
    try{
        const fileHandle = await fs.open(`./${fileName}`, 'r');
        return fileHandle;
    }
    catch(error){
        throw new Error(`Could not open log file: ${fileName}. ${error.message}`);
    }
}

async function parseLogFile(fileName, level, output = null){
    let fileHandle;

    try{
        fileHandle = await openLogFile(fileName);
        const outputFile = output ? `./${output}` 
            : (level ? `./output-${level}.log` : `./output-all.log`);
        await fs.writeFile(outputFile, '');
        // Create the async iterator object to read the file line by line
        const lineReader = fileHandle.readLines();
        const summary = {
            INFO: 0,
            WARNING: 0,
            ERROR: 0,
            total:0
        };

        for await (const line of lineReader){
            const parts = line.split(' ')
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

if (require.main === module) {
    (async function main(){
        const fileName = process.argv[2];
        const level = process.argv[3];

        if (!fileName || !level) {
            console.error('Usage: node log-parser.js <log_file> <log_level>');
            process.exit(1);
        }

        try{
            const summary = await parseLogFile(fileName, level)
            console.log(`Filter:        ${level}`)
            console.log(`Total lines:   ${summary.total}`)
            // rest of console.logs...
        } catch(error){
            console.log(`Error: ${error.message}`)
            process.exit(1)
        }
    })()
}

module.exports = {openLogFile, parseLogFile};