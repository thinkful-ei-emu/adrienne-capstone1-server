const express = require('express');
const path = require('path');
const xss = require('xss');
const requireAuth = require('../middleware/jwt_auth');
const AccommodationsService = require('./accommodations_service');

const serializeItem = item => ({
  id: item.id,
  location_name: xss(item.location_name),
  address: xss(item.address),
  start_date: xss(item.start_date),
  end_date: xss(item.end_date),
  conf_number: xss(item.conf_number),
  rewards: xss(item.rewards)
});

const accommodationsRouter = express.Router();
const jsonBodyParser = express.json();

accommodationsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    AccommodationsService.getAllItems(req.app.get('db'), req.user.id)
      .then(items => {
        res.json(items.map(serializeItem));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { location_name, address, start_date, end_date, conf_number, rewards } = req.body;
    const newItem = { location_name, address, start_date, end_date, conf_number, rewards, user_id: req.user.id };
    AccommodationsService.insertItem(
      req.app.get('db'),
      newItem
    )
      .then(item => {
        res.status(201).location(path.posix.join(req.originalUrl, `${item.id}`)).json(serializeItem(item));
      })
      .catch(next);
  });

accommodationsRouter
  .route('/:id')
  .all(requireAuth)
  .delete((req, res, next) => {
    const { id } = req.params;
    AccommodationsService.deleteItem(
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
    const { location_name, address, start_date, end_date, conf_number, rewards } = req.body;
    const itemToUpdate = { location_name, address, start_date, end_date, conf_number, rewards };

    const numOfVals = Object.values(itemToUpdate).filter(Boolean).length;
    if(numOfVals === 0) {
      return res.status(400).json({ error: { message: 'Request body must contain "location_name", "address", "start_date", "end_date", "conf_number" or "rewards"'}});
    }

    AccommodationsService.updateItem(
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

module.exports = accommodationsRouter;