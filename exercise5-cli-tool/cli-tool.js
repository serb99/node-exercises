const {openLogFile, parseLogFile} = require('../exercise2-log-parser/log-parser.js');

function parseArgs(args){
    const result = {};

    args.forEach(arg =>{
        result[arg.split('=')[0].slice(2)] = arg.split('=')[1] ?? true;
    });

    return result;
}

function validateArgs(args){
    if(args.help){
        console.log(`
        Usage: node tool.js --file=<filename> [--filter=<level>] [--output=<filename>]
        Options:
        --file=<filename>    Log file to parse (required)
        --filter=<level>     Filter by INFO, WARNING or ERROR (optional)
        --output=<filename>  Save results to file (optional)
        --help               Show this help message
        `)
        process.exit(0);
    }

    if(!args.file){
      console.error('Error: --file argument is required')
      console.error('Usage: node tool.js --file=<filename>')
      process.exit(1)  
    }

    const validLevels = ['INFO', 'WARNING', 'ERROR'];
    if(args.filter && !validLevels.includes(args.filter)){
        console.error(`Error: invalid filter level "${args.filter}"`)
        console.error(`Valid levels: ${validLevels.join(', ')}`)
        process.exit(1)
    }
}

(async function main(){
    const args = parseArgs(process.argv.slice(2));
    validateArgs(args);
    const summary = await parseLogFile(args.file, args.filter, args.output);
    
    console.log('\n=== Log Summary ===');
    console.log(`File:     ${args.file}`);
    console.log(`Filter:   ${args.filter || 'none'}`)
    console.log(`Total:    ${summary.total}`)
    console.log(`INFO:     ${summary.INFO}`)
    console.log(`WARNING:  ${summary.WARNING}`)
    console.log(`ERROR:    ${summary.ERROR}`)
    
})();