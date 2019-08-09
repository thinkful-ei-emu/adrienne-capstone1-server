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
    console.log(currentUserId);
    return knex('transportation')
      .where({ id })
      .andWhere('user_id', currentUserId)
      .update(newItemFields);
  }
};

module.exports = TransportationService;