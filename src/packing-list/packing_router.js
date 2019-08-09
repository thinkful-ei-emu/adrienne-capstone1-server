const express = require('express');
const path = require('path');
const PackingService = require('./packing_service');
const xss = require('xss');
const requireAuth = require('../middleware/jwt_auth');

const packingRouter = express.Router();
const jsonBodyParser = express.json();

const serializeItem = item => ({
  id: item.id,
  item: xss(item.item)
});

packingRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    PackingService.getAllItems(req.app.get('db'), req.user.id)
      .then(items => {
        res.json(items.map(serializeItem));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { item } = req.body;
    const newItem = { item, user_id: req.user.id };
    PackingService.insertItem(
      req.app.get('db'),
      newItem
    )
      .then(item => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${item.id}`))
          .json(serializeItem(item));
      })
      .catch(next);
  });

packingRouter
  .route('/:id')
  .all(requireAuth)
  .delete((req, res, next) => {
    const { id } = req.params;
    PackingService.deleteItem(
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
    const { item } = req.body;
    const itemToUpdate = { item };
    
    const numOfVals = Object.values(itemToUpdate).filter(Boolean).length;
    if(numOfVals === 0) {
      return res.status(400).json({ error: { message: 'Request body must contain "item"'}});
    }
    PackingService.updateItem(
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

module.exports = packingRouter;