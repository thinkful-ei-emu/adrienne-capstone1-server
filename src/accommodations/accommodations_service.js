const AccommodationsService = {
  getAllItems(knex, currentUserId) {
    return knex.select('*').from('accommodations').where('user_id', currentUserId);
  },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('accommodations')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id, currentUserId) {
    return knex.from('accommodations').select('*').where('id', id).andWhere('user_id', currentUserId).first();
  },
  deleteItem(knex, id, currentUserId) {
    return knex('accommodations')
      .where({ id })
      .andWhere('user_id', currentUserId)
      .delete();
  },
  updateItem(knex, id, item, currentUserId) {
    return knex('accommodations')
      .where({ id })
      .andWhere('user_id', currentUserId)
      .update(item);
  }
};

module.exports = AccommodationsService;