const PackingService = {
  getAllItems(knex) {
    return knex.select('*').from('packing_list');
  },
  insertItem(knex, newItem) {
    console.log(newItem);
    return knex
      .insert(newItem)
      .into('packing_list')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('packing_list').select('*').where('id', id).first();
  },
  deleteItem(knex, id) {
    return knex('packing_list')
      .where({ id })
      .delete();
  },
  updateItem(knex, id, newItemName) {
    return knex('packing_list')
      .where({ id })
      .update(newItemName);
  }
};

module.exports = PackingService;