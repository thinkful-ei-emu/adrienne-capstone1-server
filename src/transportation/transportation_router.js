const express = require('express');
const path = require('path');
const TransportationService = require('./transportation_service');
const xss = require('xss');
const requireAuth = require('../middleware/jwt_auth');

const serializeItem = item => ({
  id: item.id,
  transport_date: xss(item.transport_date),
  transport_time: xss(item.transport_time),
  transport_location: xss(item.transport_location),
  destination: xss(item.destination),
  transport_type: xss(item.transport_type),
  transport_number: xss(item.transport_number)
});

const transportationRouter = express.Router();
const jsonBodyParser = express.json();

transportationRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    TransportationService.getAllItems(req.app.get('db'), req.user.id)
      .then(items => {
        res.json(items.map(serializeItem));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { transport_date, transport_time, transport_location, destination, transport_type, transport_number } = req.body;
    const newItem = { transport_date, transport_time, transport_location, destination, transport_type, transport_number, user_id: req.user.id };
    TransportationService.insertItem(
      req.app.get('db'),
      newItem
    )
      .then(item => {
        res.status(201).location(path.posix.join(req.originalUrl, `${item.id}`)).json(serializeItem(item));
      })
      .catch(next);
  });

transportationRouter
  .route('/:id')
  .all(requireAuth)
  .delete((req, res, next) => {
    const { id } = req.params;
    TransportationService.deleteItem(
      req.app.get('db'),
      id,
      req.user.id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { transport_date, transport_time, transport_location, destination, transport_type, transport_number } = req.body;
    const itemToUpdate = { transport_date, transport_time, transport_location, destination, transport_type, transport_number };

    const numOfVals = Object.values(itemToUpdate).filter(Boolean).length;
    if(numOfVals === 0) {
      return res.status(400).json({ error: { message: 'Request body must contain either "date", "time", "location", "destination", "type", or "number"'}});
    }

    TransportationService.updateItem(
      req.app.get('db'),
      req.params.id,
      itemToUpdate,
      req.user.id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = transportationRouter;