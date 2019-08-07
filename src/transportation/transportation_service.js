const TransportationService = {
  getAllItems(knex) {
    return knex.select('*').from('transportation');
  },
  getById(knex, id) {
    return knex.from('transportation').select('*').where('id', id).first();
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
  deleteItem(knex, id) {
    return knex('transportation')
      .where({ id })
      .delete();
  },
  updateItem(knex, id, newItemFields) {
    return knex('transportation')
      .where({ id })
      .update(newItemFields);
  }
};

module.exports = TransportationService;