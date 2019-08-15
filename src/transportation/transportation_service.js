const TransportationService = {
  getAllItems(knex, currentUserId) {
    return knex.select('*').from('transportation').where('user_id', currentUserId);
  },
  getById(knex, id, currentUserId) {
    return knex.from('transportation').select('*').where('id', id).andWhere('user_id', currentUserId).first();
  },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('transportation')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteItem(knex, id, currentUserId) {
    return knex('transportation')
      .where({ id })
      .andWhere('user_id', currentUserId)
      .delete();
  },
  updateItem(knex, id, newItemFields, currentUserId) {
    return knex('transportation')
      .where({ id })
      .andWhere('user_id', currentUserId)
      .update(newItemFields);
  },
  validateLocation(transport_location) {
    if(transport_location.startsWith(' ') || transport_location.endsWith(' ')) {
      return 'Location input invalid';
    }
  },
  validateDestination(destination) {
    if(destination.startsWith(' ') || destination.endsWith(' ')) {
      return 'Destination input invalid';
    }
  },
  validateNumber(transport_number) {
    if(transport_number.startsWith(' ') || transport_number.endsWith(' ')) {
      return 'Transportation Number input invalid';
    }
  }
};

module.exports = TransportationService;