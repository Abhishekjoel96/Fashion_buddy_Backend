// backend/api/clients.js
require('dotenv').config();
const { authenticateAdmin, validateFields } = require('../../src/middleware/auth');
const clientController = require('../../src/controllers/clientController');
const { corsHeaders } = require('./_shared/cors');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
    res.setHeader('Access-Control-Max-Age', corsHeaders['Access-Control-Max-Age']);

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    // Handle request
    if (req.method === 'GET') {
        if (req.url === '/api/clients') {
            // get all clients
            await authenticateAdmin(req, res, () => clientController.getAllClients(req, res));
        }
        else if (req.url === '/api/clients/analytics') {
            // get clients analytics
            await authenticateAdmin(req, res, () => clientController.getClientAnalytics(req, res));
        }
        else {
            // get by id
            await authenticateAdmin(req, res, () => clientController.getClientById(req, res));
        }
    } else if (req.method === 'POST') {
        // create new client
        await authenticateAdmin(req, res, () => validateFields(['phone_number'])(req, res, () => clientController.createClient(req, res)));

    } else if (req.method === 'PUT') {
        // update client
        await authenticateAdmin(req, res, () => clientController.updateClient(req, res));
    }
    else if (req.method === 'DELETE') {
        // delete client
        await authenticateAdmin(req, res, () => clientController.deleteClient(req, res));
    }
    else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
