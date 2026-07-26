const http = require('node:http');

const orders = [
    { id: 1, customer: 'John', item: 'Pizza', status: 'pending' },
    { id: 2, customer: 'Maria', item: 'Burger', status: 'delivered' },
    { id: 3, customer: 'Alex', item: 'Sushi', status: 'in-transit' },
];

const server = http.createServer((req, res) => {
    const socket = req.socket;

    console.log(`Request from ${socket.remoteAddress}:${socket.remotePort}`);

    req.setTimeout(15000, () =>{
        res.writeHead(408, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: "Request timeout - Server took too long"}));
    });

    if (req.method === 'GET' && req.url === '/api/orders'){
        // return all the orders
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(orders));
    }else if(req.method === 'GET' && req.url.startsWith('/api/orders/')){
        const id = extractAndValidateId(req.url, res);
        if (id === null) return;

        const order = getElementWithId(id, res);
        if (!order) return;

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(order));
    }else if(req.method === 'POST' && req.url ==='/api/orders'){
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try{
                const reqBody = JSON.parse(body);

                if(!reqBody.customer || !reqBody.item){
                    res.writeHead(400, {'Content-Type' : 'application/json'});
                    res.end(JSON.stringify({error: 'customer and item are required'}));
                    return;
                }

                const newId = orders.length > 0
                    ? Math.max(... orders.map(o => o.id)) + 1
                    : 1;
                const newOrder = {};
                newOrder.id = newId;
                newOrder.customer = reqBody.customer;
                newOrder.item = reqBody.item;
                newOrder.status = 'pending';
                orders.push(newOrder);

                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(newOrder));

            }catch(err){
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Invalid JSON body'}));
            }
        })
    }else if(req.method === 'DELETE' && req.url.startsWith('/api/orders/')){
        const id = extractAndValidateId(req.url, res);
        if(id === null) return;

        const order = getElementWithId(id, res);
        if (!order) return;

        const index = orders.findIndex(o => o.id === id);
        orders.splice(index, 1);
        res.writeHead(204);
        res.end();
    }else{
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: "The resource not found"}));
    }
})

function extractAndValidateId(url, res){
    const id = parseInt(url.split('/')[3]);

    if (isNaN(id) || id <= 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid order ID — must be a positive integer' }));
        return null;
    } 

    return id;
}

function getElementWithId(id, res){
    const order = orders.find(o => o.id === id);
    
    if(!order){
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'The id not found'}));
        return null;
    }
    return order;
}

server.listen(3000, () => {
    console.log("The server is running on port 3000");
});

server.setTimeout(60000, (socket) => {
    socket.destroy();
});

server.on('connection', (socket) => {
    console.log(`New TCP connection: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('close', () => {
    console.log(`Connection closed: ${socket.remoteAddress}:${socket.remotePort}`);
    });
});