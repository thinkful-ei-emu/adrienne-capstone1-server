const PackingService = {
  getAllItems(knex, currentUserId) {
    return knex.select('*').from('packing_list').where('user_id', currentUserId);
  },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('packing_list')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id, currentUserId) {
    return knex.from('packing_list').select('*').where('id', id).andWhere('user_id', currentUserId).first();
  },
  deleteItem(knex, id, currentUserId) {
    return knex('packing_list')
      .where({ id })
      .andWhere('user_id', currentUserId)
      .delete();
  },
  updateItem(knex, id, item, currentUserId) {
    return knex('packing_list')
      .where({ id })
      .andWhere('user_id', currentUserId)
      .update(item);
  },
  validateItem(item) {
    if(item.startsWith(' ') || item.endsWith(' ')) {
      return 'Item must not start or end with empty spaces';
    }
  }
};

module.exports = PackingService;