import { createServer } from 'http';
import { ConnectionHandler } from './Socket/ConnectionHandler';
import fs from 'fs';

const server = createServer();
const roomSet = new ConnectionHandler();

let id = 0;
server.on('request', (req, res) => {
    const view = (status: number, object: Object) => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.write(JSON.stringify(object));
        return res.end();
    };

    const { url } = req;
    if (url === '/n/createRoom') {
        id += 1;
        const roomId = roomSet.createNewRoom(id);
        return view(200, { roomId });
    }

    if (url === '/') {
        res.writeHead(200, 'text/html');
        res.write(fs.readFileSync('src/client/index.html'));
        return res.end();
    }

    if (url === '/js/script.js') {
        res.writeHead(200, 'text/html');
        res.write(fs.readFileSync('src/client/js/script.js'));
        return res.end();
    }
    if (url === '/js/jquery.js') {
        res.writeHead(200, 'text/html');
        res.write(fs.readFileSync('src/client/js/jquery.js'));
        return res.end();
    }

    res.writeHead(404);
    res.write('API Not Found');
    return res.end();
});

roomSet.register(server);
roomSet.createNewRoom(id += 1);
roomSet.createNewRoom(id += 1);
roomSet.createNewRoom(id += 1);

server.listen(3010);
